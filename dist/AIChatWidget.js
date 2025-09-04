"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AIChatWidget;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _hooks = require("./data/hooks");
require("./AIChatWidget.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * AIChatWidget
 * - Clean and modern AI chat component
 * - Simple but professional design
 */
function AIChatWidget(_ref) {
  let {
    chatAppData = {}
  } = _ref;
  const {
    title = 'AI Assistant',
    placeholder = 'Ask me anything…',
    apiUrl = '/api/ai-assistant/chat',
    disabled = false
  } = chatAppData;
  const {
    sendMessage,
    sendMessageStream,
    isLoading,
    error
  } = (0, _hooks.useAIChat)(apiUrl);
  const [open, setOpen] = (0, _react.useState)(false);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [lines, setLines] = (0, _react.useState)([]);
  const [streamingMessageId, setStreamingMessageId] = (0, _react.useState)(null);
  const inputRef = (0, _react.useRef)(null);
  const [inputValue, setInputValue] = (0, _react.useState)('');
  const messagesEndRef = (0, _react.useRef)(null);
  const canSend = (0, _react.useMemo)(() => !disabled && !busy, [disabled, busy]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  (0, _react.useEffect)(() => {
    scrollToBottom();
  }, [lines, busy]);
  function append(text) {
    let role = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'system';
    let id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    const messageId = id || String(Date.now() + Math.random());
    setLines(prev => [...prev, {
      id: messageId,
      role,
      text
    }]);
    return messageId;
  }
  function updateMessage(id, text) {
    setLines(prev => prev.map(line => line.id === id ? {
      ...line,
      text
    } : line));
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
        await sendMessageStream(v, chunk => {
          streamedText += chunk;
          updateMessage(assistantMessageId, streamedText);
        });
        setStreamingMessageId(null);
      } else {
        // Fallback to regular message
        const res = await sendMessage(v);
        const text = formatResponse(res);
        append(text, 'assistant');
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
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "ai-chat-widget-fab"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "ai-chat-widget-fab-button",
      onClick: () => setOpen(true),
      title: title,
      "aria-label": `Open ${title}`
    }, "\uD83E\uDD16"));
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-header"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-title-section"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-icon"
  }, "\uD83E\uDD16"), /*#__PURE__*/_react.default.createElement("h3", {
    className: "ai-chat-widget-title"
  }, title)), /*#__PURE__*/_react.default.createElement("button", {
    className: "ai-chat-widget-close",
    onClick: () => setOpen(false),
    title: "Close",
    "aria-label": "Close chat"
  }, "\u2715")), /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-body"
  }, lines.length === 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-welcome"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "welcome-icon"
  }, "\uD83D\uDC4B"), /*#__PURE__*/_react.default.createElement("p", null, "Hi! I'm here to help. Ask me anything!")), lines.map(line => /*#__PURE__*/_react.default.createElement("div", {
    key: line.id,
    className: `ai-chat-widget-line ai-chat-widget-line-${line.role}`
  }, line.text, streamingMessageId === line.id && /*#__PURE__*/_react.default.createElement("span", {
    className: "streaming-cursor"
  }, "\u258A"))), busy && !streamingMessageId && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-line ai-chat-widget-line-assistant ai-chat-widget-typing"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "typing-indicator"
  }, /*#__PURE__*/_react.default.createElement("span", null), /*#__PURE__*/_react.default.createElement("span", null), /*#__PURE__*/_react.default.createElement("span", null)), "Thinking..."), /*#__PURE__*/_react.default.createElement("div", {
    ref: messagesEndRef
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-footer"
  }, error && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-error"
  }, error), /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-input-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-input-wrapper"
  }, /*#__PURE__*/_react.default.createElement("textarea", {
    ref: inputRef,
    className: "ai-chat-widget-input",
    placeholder: placeholder,
    disabled: !canSend,
    onKeyDown: handleKeyDown,
    onChange: handleInputChange,
    value: inputValue,
    rows: 1
  }), /*#__PURE__*/_react.default.createElement("button", {
    className: `ai-chat-widget-send ${!canSend || !inputValue.trim() ? 'disabled' : ''}`,
    onClick: handleSend,
    disabled: !canSend || !inputValue.trim(),
    title: "Send message",
    "aria-label": "Send message"
  }, busy ? '⏳' : '↑'))))));
}
//# sourceMappingURL=AIChatWidget.js.map