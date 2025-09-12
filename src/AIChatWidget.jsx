import React, { useMemo, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import { useAIChat } from './data/hooks';
import './AIChatWidget.css';

// Icon components (minimal SVGs)
const IconBot = ({ size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="5" y="8" width="14" height="10" rx="4"></rect>
    <path d="M12 4v4"></path>
    <circle cx="8.5" cy="12.5" r="1"></circle>
    <circle cx="15.5" cy="12.5" r="1"></circle>
  </svg>
);
const IconClose = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconSend = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M22 2L11 13"></path>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
  </svg>
);
const IconSpinner = ({ size = 16, ...props }) => (
  <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
  </svg>
);

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
          <IconBot size={22} />
        </button>
      </div>
    );
  }

  return (
    <div className="ai-chat-widget-container">
      <div className="ai-chat-widget">
        <div className="ai-chat-widget-header">
          <div className="ai-chat-widget-title-section">
            <div className="ai-chat-widget-icon"><IconBot size={18} /></div>
            <h3 className="ai-chat-widget-title">{title}</h3>
          </div>
          <button
            className="ai-chat-widget-close"
            onClick={() => setOpen(false)}
            title="Close"
            aria-label="Close chat"
          >
            <IconClose size={18} />
          </button>
        </div>
        
        <div className="ai-chat-widget-body">
          {lines.length === 0 && (
            <div className="ai-chat-widget-welcome">
              <div className="welcome-icon"><IconBot size={40} /></div>
              <p>Je suis ici pour vous aider. Posez-moi n'importe quelle question !</p>
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
                L'IA peut faire des erreurs. Veuillez vérifier les informations importantes.
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
                {busy ? <IconSpinner /> : <IconSend />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
