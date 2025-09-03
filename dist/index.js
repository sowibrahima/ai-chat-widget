"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AIChatTray = void 0;
Object.defineProperty(exports, "AIChatWidget", {
  enumerable: true,
  get: function () {
    return _AIChatWidget.default;
  }
});
exports.createConfiguredWidget = createConfiguredWidget;
exports.createSendHandler = createSendHandler;
exports.default = void 0;
exports.initPlugin = initPlugin;
exports.initStandalone = initStandalone;
exports.mountAIWidget = mountAIWidget;
Object.defineProperty(exports, "useAIChatData", {
  enumerable: true,
  get: function () {
    return _hooks.useAIChatData;
  }
});
var _react = _interopRequireWildcard(require("react"));
var _auth = require("@edx/frontend-platform/auth");
var _AIChatWidget = _interopRequireDefault(require("./AIChatWidget"));
var _hooks = require("./data/hooks");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const AIChatTray = () => {
  const {
    chatAppData
  } = (0, _hooks.useAIChatData)();
  return chatAppData?.showAIChat ? /*#__PURE__*/_react.default.createElement(_react.StrictMode, null, /*#__PURE__*/_react.default.createElement(_AIChatWidget.default, {
    chatAppData: chatAppData
  })) : '';
};
exports.AIChatTray = AIChatTray;
var _default = exports.default = AIChatTray;
// Helper: mount widget into a DOM container
function mountAIWidget(_ref) {
  let {
    container,
    onSend,
    onStartStream,
    title,
    placeholder,
    disabled
  } = _ref;
  if (!container) return;
  ReactDOM.render(/*#__PURE__*/_react.default.createElement(_AIChatWidget.default, {
    onSend,
    onStartStream,
    title,
    placeholder,
    disabled
  }), container);
}

// Factory function to create a send handler with configurable API URL
function createSendHandler(apiUrl) {
  return async function (message) {
    try {
      const client = (0, _auth.getAuthenticatedHttpClient)();
      const response = await client.post(apiUrl, {
        message
      });
      return response.data;
    } catch (error) {
      // Fallback to fetch for cross-origin issues or when authenticated client fails
      const res = await fetch(apiUrl, {
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }
  };
}

// Default networking using authenticated client for MFE environments
async function defaultSend(message, baseUrl) {
  try {
    const client = (0, _auth.getAuthenticatedHttpClient)();
    const response = await client.post(`${baseUrl}/api/ai-assistant/chat`, {
      message
    });
    return response.data;
  } catch (error) {
    // Fallback to fetch for non-MFE environments where authenticated client might not be available
    const res = await fetch(`${baseUrl}/api/ai-assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        message
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
}
function initStandalone() {
  let {
    baseUrl = window.location.origin
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Non-plugin fallback for any page
  let root = document.getElementById('ai-widget-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'ai-widget-root';
    document.body.appendChild(root);
  }
  return mountAIWidget({
    container: root,
    onSend: m => defaultSend(m, baseUrl),
    onStartStream: () => {}
  });
}

// Plugin bootstrap for MFEs with a plugin/slot API
function initPlugin() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const api = window?.PluginAPI ||
  // potential plugin API
  window?.openEdx?.plugin || window?.edx?.plugins || null;
  const fill = (slotName, render) => {
    // Generic slot registration if an API is available
    if (api && typeof api.register === 'function') {
      api.register(slotName, render);
      return true;
    }
    return false;
  };
  const renderWidget = el => {
    if (!el) return;
    const baseUrl = options.baseUrl || window.location.origin;
    mountAIWidget({
      container: el,
      onSend: m => options.onSend ? options.onSend(m) : defaultSend(m, baseUrl),
      onStartStream: options.onStartStream || (() => {}),
      title: options.title,
      placeholder: options.placeholder,
      disabled: options.disabled
    });
  };

  // Known footer slots
  const learningFooter = 'org.openedx.frontend.layout.footer.v1';
  const studioFooter = 'org.openedx.frontend.layout.studio_footer.v1';
  const attachedToLearning = fill(learningFooter, renderWidget);
  const attachedToStudio = fill(studioFooter, renderWidget);
  if (!attachedToLearning && !attachedToStudio) {
    // Fallback: mount globally
    initStandalone(options);
  }
}

// Factory to create a pre-configured widget component
function createConfiguredWidget(config) {
  return function ConfiguredAIChatWidget(props) {
    return /*#__PURE__*/_react.default.createElement(_AIChatWidget.default, {
      ...props,
      onSend: config.apiUrl ? createSendHandler(config.apiUrl) : props.onSend,
      title: config.title || props.title
    });
  };
}
//# sourceMappingURL=index.js.map