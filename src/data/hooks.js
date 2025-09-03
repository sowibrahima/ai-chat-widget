import { useState, useEffect } from 'react';

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
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading, error };
};
