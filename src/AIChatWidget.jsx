import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAIChat } from './data/hooks';
import './AIChatWidget.css';

/**
 * AIChatWidget
 * - Main AI chat component following edX frontend plugin patterns
 * - Uses hooks for data management and API calls
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

  async function handleSend() {
    const v = (inputRef.current?.value || '').trim();
    if (!v || !canSend) return;
    append(`You: ${v}`, 'user');
    inputRef.current.value = '';
    setBusy(true);
    try {
      const res = await sendMessage(v);
      const text = typeof res === 'string' ? res : (res?.text ?? JSON.stringify(res));
      append(text, 'assistant');
    } catch (e) {
      append(`Error: ${e?.message || String(e)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  function handleStream() {
    try {
      const ctrl = onStartStream?.();
      append('[stream] started');
      // Caller should append partials by controlling parent state, or replace this with prop callback.
      // We keep a minimal message here; advanced streaming handled by integrator.
      if (ctrl && typeof ctrl.close === 'function') {
        // no-op; integrator will close when done
      }
    } catch (e) {
      append(`[stream] error: ${e?.message || String(e)}`, 'error');
    }
  }

  return (
    <div className="aiw-root">
      <button
        type="button"
        className="aiw-fab"
        aria-label="Open AI Assistant"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
      >
        ✦
      </button>

      <div className={`aiw-panel ${open ? 'aiw-open' : ''}`}>
        <div className="aiw-header">
          <strong>{title}</strong>
          <button type="button" className="aiw-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>
        <div className="aiw-output" role="log" aria-live="polite">
          {lines.map(l => (
            <div key={l.id} className={`aiw-line aiw-${l.role}`}>{l.text}</div>
          ))}
        </div>
        <div className="aiw-input">
          <textarea ref={inputRef} placeholder={placeholder} disabled={!canSend} />
          <div className="aiw-controls">
            <button type="button" className="aiw-btn aiw-primary" onClick={handleSend} disabled={!canSend}>Send</button>
            <button type="button" className="aiw-btn" onClick={handleStream} disabled={disabled}>Test Stream</button>
          </div>
        </div>
      </div>
    </div>
  );
}
