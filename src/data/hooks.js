import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * Extract course_id from current page URL using Open edX patterns
 */
const getCourseIdFromUrl = () => {
  const path = window.location.pathname;
  
  // Pattern: /courses/course-v1:org+course+run/...
  if (path.includes('/courses/')) {
    const match = path.match(/\/courses\/([^/]+)/);
    if (match && match[1] && match[1].includes('course-v1:')) {
      return match[1];
    }
  }
  
  // Pattern: /course/course-v1:org+course+run/...
  if (path.includes('/course/')) {
    const match = path.match(/\/course\/([^/]+)/);
    if (match && match[1] && match[1].includes('course-v1:')) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Extract block_id from current page URL or DOM
 */
const getBlockIdFromContext = () => {
  // Try to get from URL hash or query params first
  const urlParams = new URLSearchParams(window.location.search);
  const blockId = urlParams.get('block_id') || urlParams.get('unit_id');
  if (blockId) return blockId;
  
  // Try to get from URL path
  const path = window.location.pathname;
  const blockMatch = path.match(/block-v1:[^/]+/);
  if (blockMatch) return blockMatch[0];
  
  // Try to get from DOM data attributes (common in Open edX)
  const unitElement = document.querySelector('[data-unit-id]');
  if (unitElement) return unitElement.getAttribute('data-unit-id');
  
  const blockElement = document.querySelector('[data-block-id]');
  if (blockElement) return blockElement.getAttribute('data-block-id');
  
  return null;
};

/**
 * Build dynamic API URL with course and block context
 */
const buildApiUrl = (baseUrl, courseId, blockId) => {
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  if (courseId && blockId) {
    return `${cleanBaseUrl}/${encodeURIComponent(courseId)}/${encodeURIComponent(blockId)}/`;
  } else if (courseId) {
    return `${cleanBaseUrl}/${encodeURIComponent(courseId)}/`;
  }
  
  // Fallback to original URL if no context found
  return baseUrl;
};

/**
 * Hook to manage AI chat application data and configuration
 */
export const useAIChatData = () => {
  const [chatAppData, setChatAppData] = useState({
    showAIChat: true,
    apiUrl: '/api/ai-assistant/chat',
    title: 'AI Assistant',
    placeholder: 'Ask me anything...',
    disabled: false,
  });

  useEffect(() => {
    // Initialize chat configuration from global config or environment
    const config = window.aiChatConfig || {};
    
    // Extract course and block context
    const courseId = getCourseIdFromUrl();
    const blockId = getBlockIdFromContext();
    
    // Build dynamic API URL with context
    const baseApiUrl = config.apiUrl || '/api/ai-assistant/chat';
    const dynamicApiUrl = buildApiUrl(baseApiUrl, courseId, blockId);
    
    setChatAppData(prevData => ({
      ...prevData,
      ...config,
      apiUrl: dynamicApiUrl,
      courseId,
      blockId,
    }));
  }, []);

  return { chatAppData };
};

/**
 * Hook to handle AI chat messaging with streaming support
 */
export const useAIChat = (apiUrl, sessionId = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  const sendMessage = async (message) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = { message };
      if (currentSessionId) {
        payload.session_id = currentSessionId;
      }
      
      const client = getAuthenticatedHttpClient();
      const response = await client.post(apiUrl, payload);
      
      // Extract session_id from response if available
      if (response.data?.session_id && !currentSessionId) {
        setCurrentSessionId(response.data.session_id);
      }
      
      return response.data;
    } catch (err) {
      // Fallback to fetch for cross-origin issues or when authenticated client fails
      try {
        const payload = { message };
        if (currentSessionId) {
          payload.session_id = currentSessionId;
        }
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // Extract session_id from response if available
        if (result?.session_id && !currentSessionId) {
          setCurrentSessionId(result.session_id);
        }
        
        return result;
      } catch (fetchErr) {
        setError(fetchErr.message);
        throw fetchErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageStream = async (message, onChunk) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = { message };
      if (currentSessionId) {
        payload.session_id = currentSessionId;
      }
      
      // Use streaming endpoint
      const streamUrl = apiUrl.replace('/chat', '/chat/stream');
      
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return fullResponse;
            }
            
            try {
              const chunk = JSON.parse(data);
              const content = chunk.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON chunks
              console.warn('Invalid chunk JSON:', data);
            }
          }
        }
      }
      
      return fullResponse;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, sendMessageStream, isLoading, error, sessionId: currentSessionId };
};

/**
 * Hook for course generation functionality
 */
export const useCourseGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const uploadFile = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const client = getAuthenticatedHttpClient();
      const response = await client.post('/api/ai-assistant/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createGenerationJob = async (jobData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = getAuthenticatedHttpClient();
      const response = await client.post(`/api/ai-assistant/generate/${jobData.course_id}/`, {
        job_type: jobData.job_type,
        instructions: jobData.instructions,
        pdf_file: jobData.pdf_file,
        model_config: jobData.model_config,
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create generation job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getJobStatus = async (jobId) => {
    try {
      const client = getAuthenticatedHttpClient();
      const response = await client.get(`/api/ai-assistant/jobs/${jobId}/`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to get job status';
      throw new Error(errorMessage);
    }
  };

  const listJobs = async (courseId = null) => {
    try {
      const client = getAuthenticatedHttpClient();
      const url = courseId 
        ? `/api/ai-assistant/jobs/?course_id=${courseId}`
        : '/api/ai-assistant/jobs/';
      const response = await client.get(url);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to list jobs';
      throw new Error(errorMessage);
    }
  };

  // Legacy method for backward compatibility
  const generateCourse = async (courseId, formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = getAuthenticatedHttpClient();
      const apiUrl = `/api/ai-assistant/generate/${encodeURIComponent(courseId)}/`;
      const response = await client.post(apiUrl, formData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { 
    uploadFile,
    createGenerationJob,
    getJobStatus,
    listJobs,
    generateCourse, // Legacy support
    isLoading, 
    error 
  };
};

// Export utility functions for external use
export { getCourseIdFromUrl, getBlockIdFromContext, buildApiUrl };
