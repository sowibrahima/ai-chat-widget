import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
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

  const { sendMessage, isLoading, error } = useAIChat(apiUrl);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState([]);
  const inputRef = useRef(null);

  const canSend = useMemo(() => !disabled && !busy, [disabled, busy]);

  function append(text, role = 'system') {
    setLines(prev => [...prev, { id: String(prev.length + 1), role, text }]);
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
    const v = (inputRef.current?.value || '').trim();
    if (!v || !canSend) return;
    append(`You: ${v}`, 'user');
    inputRef.current.value = '';
    setBusy(true);
    try {
      const res = await sendMessage(v);
      const text = formatResponse(res);
      append(text, 'assistant');
    } catch (e) {
      const errorMessage = formatError(e);
      append(errorMessage, 'error');
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
              {line.text}
            </div>
          ))}
          {busy && (
            <div className="ai-chat-widget-line ai-chat-widget-line-assistant ai-chat-widget-typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Thinking...
            </div>
          )}
        </div>
        
        <div className="ai-chat-widget-footer">
          {error && (
            <div className="ai-chat-widget-error">
              {error}
            </div>
          )}
          <div className="ai-chat-widget-input-container">
            <textarea
              ref={inputRef}
              className="ai-chat-widget-input"
              placeholder={placeholder}
              disabled={!canSend}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button
              className={`ai-chat-widget-send ${!canSend ? 'disabled' : ''}`}
              onClick={handleSend}
              disabled={!canSend}
              title="Send message"
              aria-label="Send message"
            >
              {busy ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
