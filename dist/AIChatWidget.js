"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AIChatWidget;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _reactMarkdown = _interopRequireDefault(require("react-markdown"));
var _hooks = require("./data/hooks");
require("./AIChatWidget.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Icon components (minimal SVGs)
const IconBot = _ref => {
  let {
    size = 20,
    ...props
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, props), /*#__PURE__*/_react.default.createElement("rect", {
    x: "5",
    y: "8",
    width: "14",
    height: "10",
    rx: "4"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M12 4v4"
  }), /*#__PURE__*/_react.default.createElement("circle", {
    cx: "8.5",
    cy: "12.5",
    r: "1"
  }), /*#__PURE__*/_react.default.createElement("circle", {
    cx: "15.5",
    cy: "12.5",
    r: "1"
  }));
};
const IconClose = _ref2 => {
  let {
    size = 18,
    ...props
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, props), /*#__PURE__*/_react.default.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/_react.default.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }));
};
const IconSend = _ref3 => {
  let {
    size = 16,
    ...props
  } = _ref3;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M22 2L11 13"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M22 2L15 22L11 13L2 9L22 2Z"
  }));
};
const IconSpinner = _ref4 => {
  let {
    size = 16,
    ...props
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    className: "spinner",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, props), /*#__PURE__*/_react.default.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "3",
    fill: "none",
    opacity: "0.2"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M22 12a10 10 0 0 1-10 10",
    stroke: "currentColor",
    strokeWidth: "3",
    fill: "none"
  }));
};

/**
 * AIChatWidget
 * - Clean and modern AI chat component
 * - Simple but professional design
 */
function AIChatWidget(_ref5) {
  let {
    chatAppData = {}
  } = _ref5;
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
  const [hasFirstAIResponse, setHasFirstAIResponse] = (0, _react.useState)(false);
  const inputRef = (0, _react.useRef)(null);
  const [inputValue, setInputValue] = (0, _react.useState)('');
  const messagesEndRef = (0, _react.useRef)(null);
  const canSend = (0, _react.useMemo)(() => !disabled && !busy, [disabled, busy]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    // Ensure headings have proper styling
    h1: _ref6 => {
      let {
        children
      } = _ref6;
      return /*#__PURE__*/_react.default.createElement("h1", {
        className: "markdown-h1"
      }, children);
    },
    h2: _ref7 => {
      let {
        children
      } = _ref7;
      return /*#__PURE__*/_react.default.createElement("h2", {
        className: "markdown-h2"
      }, children);
    },
    h3: _ref8 => {
      let {
        children
      } = _ref8;
      return /*#__PURE__*/_react.default.createElement("h3", {
        className: "markdown-h3"
      }, children);
    },
    h4: _ref9 => {
      let {
        children
      } = _ref9;
      return /*#__PURE__*/_react.default.createElement("h4", {
        className: "markdown-h4"
      }, children);
    },
    h5: _ref0 => {
      let {
        children
      } = _ref0;
      return /*#__PURE__*/_react.default.createElement("h5", {
        className: "markdown-h5"
      }, children);
    },
    h6: _ref1 => {
      let {
        children
      } = _ref1;
      return /*#__PURE__*/_react.default.createElement("h6", {
        className: "markdown-h6"
      }, children);
    },
    // Style code blocks
    code: _ref10 => {
      let {
        children,
        className
      } = _ref10;
      return /*#__PURE__*/_react.default.createElement("code", {
        className: `markdown-code ${className || ''}`
      }, children);
    },
    // Style lists
    ul: _ref11 => {
      let {
        children
      } = _ref11;
      return /*#__PURE__*/_react.default.createElement("ul", {
        className: "markdown-ul"
      }, children);
    },
    ol: _ref12 => {
      let {
        children
      } = _ref12;
      return /*#__PURE__*/_react.default.createElement("ol", {
        className: "markdown-ol"
      }, children);
    },
    li: _ref13 => {
      let {
        children
      } = _ref13;
      return /*#__PURE__*/_react.default.createElement("li", {
        className: "markdown-li"
      }, children);
    },
    // Style paragraphs
    p: _ref14 => {
      let {
        children
      } = _ref14;
      return /*#__PURE__*/_react.default.createElement("p", {
        className: "markdown-p"
      }, children);
    }
  };

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
    return 'Quelque chose s\'est mal passé. Veuillez réessayer.';
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
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "ai-chat-widget-fab"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "ai-chat-widget-fab-button",
      onClick: () => setOpen(true),
      title: title,
      "aria-label": `Ouvrir ${title}`
    }, /*#__PURE__*/_react.default.createElement(IconBot, {
      size: 22
    })));
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
  }, /*#__PURE__*/_react.default.createElement(IconBot, {
    size: 18
  })), /*#__PURE__*/_react.default.createElement("h3", {
    className: "ai-chat-widget-title"
  }, title)), /*#__PURE__*/_react.default.createElement("button", {
    className: "ai-chat-widget-close",
    onClick: () => setOpen(false),
    title: "Close",
    "aria-label": "Close chat"
  }, /*#__PURE__*/_react.default.createElement(IconClose, {
    size: 18
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-body"
  }, lines.length === 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-welcome"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "welcome-icon"
  }, /*#__PURE__*/_react.default.createElement(IconBot, {
    size: 40
  })), /*#__PURE__*/_react.default.createElement("p", null, "Je suis ici pour vous aider. Posez-moi n'importe quelle question !")), lines.map(line => /*#__PURE__*/_react.default.createElement("div", {
    key: line.id,
    className: `ai-chat-widget-line ai-chat-widget-line-${line.role}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "message-content"
  }, /*#__PURE__*/_react.default.createElement(_reactMarkdown.default, {
    components: markdownComponents
  }, line.text || '')), streamingMessageId === line.id && /*#__PURE__*/_react.default.createElement("span", {
    className: "streaming-cursor"
  }, "\u258A"))), busy && !streamingMessageId && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-line ai-chat-widget-line-assistant ai-chat-widget-typing"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "typing-indicator"
  }, /*#__PURE__*/_react.default.createElement("span", null), /*#__PURE__*/_react.default.createElement("span", null), /*#__PURE__*/_react.default.createElement("span", null)), "R\xE9ponse en cours..."), hasFirstAIResponse && /*#__PURE__*/_react.default.createElement("div", {
    className: "ai-chat-widget-disclaimer"
  }, /*#__PURE__*/_react.default.createElement("p", null, "L'IA peut faire des erreurs. Veuillez v\xE9rifier les informations importantes.")), /*#__PURE__*/_react.default.createElement("div", {
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
  }, busy ? /*#__PURE__*/_react.default.createElement(IconSpinner, null) : /*#__PURE__*/_react.default.createElement(IconSend, null)))))));
}
//# sourceMappingURL=AIChatWidget.js.map