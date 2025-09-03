import React, { StrictMode } from 'react';
import AIChatWidget from './AIChatWidget';
import { useAIChatData } from './data/hooks';

export const AIChatTray = () => {
  const { chatAppData } = useAIChatData();
  return chatAppData?.showAIChat
    ? <StrictMode><AIChatWidget chatAppData={chatAppData} /></StrictMode>
    : '';
};

export default AIChatTray;
export { AIChatWidget, useAIChatData };

// Helper: mount widget into a DOM container
export function mountAIWidget({
  container,
  onSend,
  onStartStream,
  title,
  placeholder,
  disabled,
}) {
  if (!container) return;
  ReactDOM.render(
    React.createElement(AIChatWidget, { onSend, onStartStream, title, placeholder, disabled }),
    container
  );
}

// Factory function to create a send handler with configurable API URL
export function createSendHandler(apiUrl) {
  return async function(message) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
      },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };
}

// Minimal default networking using fetch; MFEs should pass authenticatedHttpClient alternatives
async function defaultSend(message, baseUrl) {
  const res = await fetch(`${baseUrl}/api/ai-assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export function initStandalone({ baseUrl = window.location.origin } = {}) {
  // Non-plugin fallback for any page
  let root = document.getElementById('ai-widget-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'ai-widget-root';
    document.body.appendChild(root);
  }
  return mountAIWidget({
    container: root,
    onSend: (m) => defaultSend(m, baseUrl),
    onStartStream: () => {},
  });
}

// Plugin bootstrap for MFEs with a plugin/slot API
export function initPlugin(options = {}) {
  const api =
    window?.PluginAPI || // potential plugin API
    window?.openEdx?.plugin ||
    window?.edx?.plugins ||
    null;

  const fill = (slotName, render) => {
    // Generic slot registration if an API is available
    if (api && typeof api.register === 'function') {
      api.register(slotName, render);
      return true;
    }
    return false;
  };

  const renderWidget = (el) => {
    if (!el) return;
    const baseUrl = options.baseUrl || window.location.origin;
    mountAIWidget({
      container: el,
      onSend: (m) => (options.onSend ? options.onSend(m) : defaultSend(m, baseUrl)),
      onStartStream: options.onStartStream || (() => {}),
      title: options.title,
      placeholder: options.placeholder,
      disabled: options.disabled,
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
export function createConfiguredWidget(config) {
  return function ConfiguredAIChatWidget(props) {
    return React.createElement(AIChatWidget, {
      ...props,
      onSend: config.apiUrl ? createSendHandler(config.apiUrl) : props.onSend,
      title: config.title || props.title,
    });
  };
}
