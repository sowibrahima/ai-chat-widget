# AI Chat Widget

A floating AI chat widget for Open edX MFEs, built following edX frontend plugin architecture patterns.

## Purpose

This widget provides an AI-powered chat interface that can be integrated into Open edX MFEs (Micro Frontend Applications) using the frontend plugin framework.

## Architecture

This package follows the same architecture as other edX frontend plugins:
- Uses `@openedx/frontend-build` for build tooling
- Exports React components with proper hooks
- Follows edX coding standards and patterns
- Uses Makefile for build process

## Getting Started

### Installation

```bash
npm install @wutiskill/ai-chat-widget
```

### Usage

```javascript
import { AIChatTray } from '@wutiskill/ai-chat-widget';

// Configure the widget globally
window.aiChatConfig = {
  showAIChat: true,
  apiUrl: '/api/ai-assistant/chat',
  title: 'AI Assistant',
  placeholder: 'Ask me anything...',
  disabled: false,
};

// Use in your MFE
<AIChatTray />
```

### Development

```bash
# Install dependencies
npm ci

# Build the package
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Configuration

The widget can be configured via the global `window.aiChatConfig` object:

- `showAIChat`: Boolean to show/hide the widget
- `apiUrl`: API endpoint for chat messages
- `title`: Widget title
- `placeholder`: Input placeholder text
- `disabled`: Disable the widget

## Integration with Tutor

This widget is designed to work with the `tutor-contrib-ws-ai-assistant-plugin` for seamless integration into Open edX environments.

## License

AGPL-3.0
