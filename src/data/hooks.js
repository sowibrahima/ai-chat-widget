import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading, error };
};
