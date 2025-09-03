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
 * - Main AI chat component following edX frontend plugin patterns
 * - Uses hooks for data management and API calls
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
    isLoading,
    error
  } = (0, _hooks.useAIChat)(apiUrl);
  const [open, setOpen] = (0, _react.useState)(false);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [lines, setLines] = (0, _react.useState)([]);
  const inputRef = (0, _react.useRef)(null);
  const canSend = (0, _react.useMemo)(() => !disabled && !busy, [disabled, busy]);
  function append(text) {
    let role = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'system';
    setLines(prev => [...prev, {
      id: String(prev.length + 1),
      role,
      text
    }]);
  }
  async function handleSend() {
    const v = (inputRef.current?.value || '').trim();
    if (!v || !canSend) return;
    append(`You: ${v}`, 'user');
    inputRef.current.value = '';
    setBusy(true);
    try {
      const res = await sendMessage(v);
      const text = typeof res === 'string' ? res : res?.text ?? JSON.stringify(res);
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
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "aiw-root"
  }, /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "aiw-fab",
    "aria-label": "Open AI Assistant",
    onClick: () => setOpen(o => !o),
    disabled: disabled
  }, "\u2726"), /*#__PURE__*/_react.default.createElement("div", {
    className: `aiw-panel ${open ? 'aiw-open' : ''}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "aiw-header"
  }, /*#__PURE__*/_react.default.createElement("strong", null, title), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "aiw-close",
    onClick: () => setOpen(false),
    "aria-label": "Close"
  }, "\xD7")), /*#__PURE__*/_react.default.createElement("div", {
    className: "aiw-output",
    role: "log",
    "aria-live": "polite"
  }, lines.map(l => /*#__PURE__*/_react.default.createElement("div", {
    key: l.id,
    className: `aiw-line aiw-${l.role}`
  }, l.text))), /*#__PURE__*/_react.default.createElement("div", {
    className: "aiw-input"
  }, /*#__PURE__*/_react.default.createElement("textarea", {
    ref: inputRef,
    placeholder: placeholder,
    disabled: !canSend
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "aiw-controls"
  }, /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "aiw-btn aiw-primary",
    onClick: handleSend,
    disabled: !canSend
  }, "Send"), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "aiw-btn",
    onClick: handleStream,
    disabled: disabled
  }, "Test Stream")))));
}
//# sourceMappingURL=AIChatWidget.js.map