import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * Hook to manage AI chat application data and configuration
 */
export const useAIChatData = () => {
  const [chatAppData, setChatAppData] = useState({
    showAIChat: true,
    apiUrl: 'http://apps.local.openedx.io:8000/api/ai-assistant/chat',
    title: 'AI Assistant',
    placeholder: 'Ask me anything...',
    disabled: false,
  });

  useEffect(() => {
    // Initialize chat configuration from global config or environment
    const config = window.aiChatConfig || {};
    setChatAppData(prevData => ({
      ...prevData,
      ...config,
    }));
  }, []);

  return { chatAppData };
};

/**
 * Hook to handle AI chat messaging
 */
export const useAIChat = (apiUrl) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = getAuthenticatedHttpClient();
      const response = await client.post(apiUrl, { message });
      return response.data;
    } catch (err) {
      // Fallback to fetch for cross-origin issues or when authenticated client fails
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
          },
          credentials: 'include',
          body: JSON.stringify({ message }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        return result;
      } catch (fetchErr) {
        setError(fetchErr.message);
        throw fetchErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading, error };
};
