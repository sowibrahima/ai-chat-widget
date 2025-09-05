import React, { useMemo, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import { useAIChat } from './data/hooks';
import './AIChatWidget.css';

/**
 * AIChatWidget
 * - Clean and modern AI chat component
 * - Simple but professional design
 */
export default function AIChatWidget({
  chatAppData = {},
}) {
  const {
    title = 'AI Assistant',
    placeholder = 'Ask me anything…',
    apiUrl = '/api/ai-assistant/chat',
    disabled = false,
  } = chatAppData;

  const { sendMessage, sendMessageStream, isLoading, error } = useAIChat(apiUrl);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState([]);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [hasFirstAIResponse, setHasFirstAIResponse] = useState(false);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => !disabled && !busy, [disabled, busy]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    // Ensure headings have proper styling
    h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
    // Style code blocks
    code: ({ children, className }) => (
      <code className={`markdown-code ${className || ''}`}>{children}</code>
    ),
    // Style lists
    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
    li: ({ children }) => <li className="markdown-li">{children}</li>,
    // Style paragraphs
    p: ({ children }) => <p className="markdown-p">{children}</p>,
  };

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, busy]);

  function append(text, role = 'system', id = null) {
    const messageId = id || String(Date.now() + Math.random());
    setLines(prev => [...prev, { id: messageId, role, text }]);
    return messageId;
  }

  function updateMessage(id, text) {
    setLines(prev => prev.map(line => 
      line.id === id ? { ...line, text } : line
    ));
  }

  function formatResponse(res) {
    if (typeof res === 'string') {
      return res;
    }
    
    // Handle structured response with message field
    if (res?.message) {
      return res.message;
    }
    
    // Handle error responses with metadata
    if (res?.metadata?.error) {
      return res.metadata.error;
    }
    
    // Fallback to text field or stringify
    return res?.text || JSON.stringify(res);
  }

  function formatError(error) {
    // Try to extract meaningful error message
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.detail) {
      return error.detail;
    }
    
    return 'Something went wrong. Please try again.';
  }

  async function handleSend() {
    const v = inputValue.trim();
    if (!v || !canSend) return;
    
    // Add user message
    append(v, 'user');
    setInputValue('');
    setBusy(true);
    
    try {
      // Try streaming first, fallback to regular if not available
      if (sendMessageStream) {
        const assistantMessageId = append('', 'assistant');
        setStreamingMessageId(assistantMessageId);
        let streamedText = '';
        
        await sendMessageStream(v, (chunk) => {
          streamedText += chunk;
          updateMessage(assistantMessageId, streamedText);
        });
        
        setStreamingMessageId(null);
        setHasFirstAIResponse(true);
      } else {
        // Fallback to regular message
        const res = await sendMessage(v);
        const text = formatResponse(res);
        append(text, 'assistant');
        setHasFirstAIResponse(true);
      }
    } catch (e) {
      const errorMessage = formatError(e);
      append(errorMessage, 'error');
      setStreamingMessageId(null);
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(e) {
    setInputValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  if (!open) {
    return (
      <div className="ai-chat-widget-fab">
        <button
          className="ai-chat-widget-fab-button"
          onClick={() => setOpen(true)}
          title={title}
          aria-label={`Open ${title}`}
        >
          🤖
        </button>
      </div>
    );
  }

  return (
    <div className="ai-chat-widget-container">
      <div className="ai-chat-widget">
        <div className="ai-chat-widget-header">
          <div className="ai-chat-widget-title-section">
            <div className="ai-chat-widget-icon">🤖</div>
            <h3 className="ai-chat-widget-title">{title}</h3>
          </div>
          <button
            className="ai-chat-widget-close"
            onClick={() => setOpen(false)}
            title="Close"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
        
        <div className="ai-chat-widget-body">
          {lines.length === 0 && (
            <div className="ai-chat-widget-welcome">
              <div className="welcome-icon">👋</div>
              <p>Hi! I'm here to help. Ask me anything!</p>
            </div>
          )}
          {lines.map(line => (
            <div key={line.id} className={`ai-chat-widget-line ai-chat-widget-line-${line.role}`}>
              <div className="message-content">
                <ReactMarkdown components={markdownComponents}>
                  {line.text || ''}
                </ReactMarkdown>
              </div>
              {streamingMessageId === line.id && (
                <span className="streaming-cursor">▊</span>
              )}
            </div>
          ))}
          {busy && !streamingMessageId && (
            <div className="ai-chat-widget-line ai-chat-widget-line-assistant ai-chat-widget-typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Thinking...
            </div>
          )}
          {hasFirstAIResponse && (
            <div className="ai-chat-widget-disclaimer">
              <p>
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="ai-chat-widget-footer">
          {error && (
            <div className="ai-chat-widget-error">
              {error}
            </div>
          )}
          <div className="ai-chat-widget-input-container">
            <div className="ai-chat-widget-input-wrapper">
              <textarea
                ref={inputRef}
                className="ai-chat-widget-input"
                placeholder={placeholder}
                disabled={!canSend}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                value={inputValue}
                rows={1}
              />
              <button
                className={`ai-chat-widget-send ${!canSend || !inputValue.trim() ? 'disabled' : ''}`}
                onClick={handleSend}
                disabled={!canSend || !inputValue.trim()}
                title="Send message"
                aria-label="Send message"
              >
                {busy ? '⏳' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
