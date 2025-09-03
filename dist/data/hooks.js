"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAIChatData = exports.useAIChat = void 0;
var _react = require("react");
/**
 * Hook to manage AI chat application data and configuration
 */
const useAIChatData = () => {
  const [chatAppData, setChatAppData] = (0, _react.useState)({
    showAIChat: true,
    apiUrl: '/api/ai-assistant/chat',
    title: 'AI Assistant',
    placeholder: 'Ask me anything...',
    disabled: false
  });
  (0, _react.useEffect)(() => {
    // Initialize chat configuration from global config or environment
    const config = window.aiChatConfig || {};
    setChatAppData(prevData => ({
      ...prevData,
      ...config
    }));
  }, []);
  return {
    chatAppData
  };
};

/**
 * Hook to handle AI chat messaging
 */
exports.useAIChatData = useAIChatData;
const useAIChat = apiUrl => {
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)(null);
  const sendMessage = async message => {
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
        body: JSON.stringify({
          message
        })
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
  return {
    sendMessage,
    isLoading,
    error
  };
};
exports.useAIChat = useAIChat;
//# sourceMappingURL=hooks.js.map