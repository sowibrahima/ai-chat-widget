import React, { StrictMode } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import AIChatWidget from './AIChatWidget';
import CourseGenerationModal from './CourseGenerationModal';
import CourseGenerationButton from './CourseGenerationButton';
import { useAIChatData } from './data/hooks';

export const AIChatTray = () => {
  const { chatAppData } = useAIChatData();
  return chatAppData?.showAIChat
    ? <StrictMode><AIChatWidget chatAppData={chatAppData} /></StrictMode>
    : '';
};

export default AIChatTray;
export { AIChatWidget, CourseGenerationModal, CourseGenerationButton, useAIChatData };

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
    try {
      const client = getAuthenticatedHttpClient();
      const response = await client.post(apiUrl, { message });
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
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }
  };
}

// Default networking using authenticated client for MFE environments
async function defaultSend(message, baseUrl) {
  try {
    const client = getAuthenticatedHttpClient();
    const response = await client.post(`${baseUrl}/api/ai-assistant/chat`, { message });
    return response.data;
  } catch (error) {
    // Fallback to fetch for non-MFE environments where authenticated client might not be available
    const res = await fetch(`${baseUrl}/api/ai-assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
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

// Global function to open course generation modal
export function openCourseGenerationModal(options = {}) {
  const {
    courseId = getCourseIdFromUrl(),
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {}
  } = options;

  if (!courseId) {
    const error = new Error('Could not determine course ID from URL');
    onError(error);
    return;
  }

  // Create modal container
  let modalContainer = document.getElementById('ws-ai-assistant-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'ws-ai-assistant-modal-container';
    document.body.appendChild(modalContainer);
  }

  const handleClose = () => {
    if (window.ReactDOM && modalContainer) {
      window.ReactDOM.unmountComponentAtNode(modalContainer);
    }
    onClose();
  };

  const handleSuccess = (result) => {
    onSuccess(result);
    handleClose();
  };

  const handleError = (error) => {
    onError(error);
    handleClose();
  };

  // Try to use React components if available
  if (window.React && window.ReactDOM && CourseGenerationModal) {
    const modalProps = {
      isOpen: true,
      courseId: courseId,
      onClose: handleClose,
      onSuccess: handleSuccess,
      onError: handleError,
      availableModels: [
        { id: 'gpt-4o', name: 'GPT-4o (Recommended)', description: 'Best quality, slower' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, good quality' }
      ]
    };

    window.ReactDOM.render(
      window.React.createElement(CourseGenerationModal, modalProps),
      modalContainer
    );
  } else {
    // Fallback to simple HTML modal
    showSimpleCourseGenerationModal(courseId, handleSuccess, handleError, handleClose);
  }
}

// Fallback simple modal implementation
function showSimpleCourseGenerationModal(courseId, onSuccess, onError, onClose) {
  const modalHtml = `
    <div class="modal fade show" style="display: block; z-index: 10000;" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <span class="fa fa-magic" style="margin-right: 8px;"></span>
              AI Course Generation
            </h5>
            <button type="button" class="close" onclick="window.WSAIAssistant.closeCourseGenerationModal()">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="ws-ai-course-form">
              <div class="form-group">
                <label>PDF Document:</label>
                <input type="file" class="form-control-file" id="ws-ai-file" accept=".pdf" required>
                <small class="text-muted">Upload a PDF document (max 50MB)</small>
              </div>
              <div class="form-group">
                <label>AI Model:</label>
                <select class="form-control" id="ws-ai-model">
                  <option value="gpt-4o">GPT-4o (Recommended) - Best quality, slower</option>
                  <option value="gpt-4o-mini">GPT-4o Mini - Faster, good quality</option>
                </select>
              </div>
              <div class="form-group">
                <label>Generation Instructions:</label>
                <textarea class="form-control" id="ws-ai-instructions" rows="4" maxlength="1000" required
                  placeholder="Describe what kind of course content you want to generate. For example: 'Create a comprehensive course with modules, lessons, quizzes, and assignments based on this document. Focus on practical applications and include interactive elements.'"></textarea>
                <small class="text-muted">
                  <span id="ws-ai-char-count">0</span>/1000 characters
                </small>
              </div>
              <div id="ws-ai-progress" class="form-group" style="display: none;">
                <label>Generation Progress:</label>
                <div class="progress">
                  <div id="ws-ai-progress-bar" class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
                <small id="ws-ai-status" class="text-muted">Starting...</small>
              </div>
              <div id="ws-ai-error" class="alert alert-danger" style="display: none;"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ai-chat btn-ai-chat-secondary" onclick="window.WSAIAssistant.closeCourseGenerationModal()">Cancel</button>
            <button type="button" class="btn-ai-chat btn-ai-chat-primary" id="ws-ai-submit">
              <span class="fa fa-magic" style="margin-right: 6px;"></span>
              Generate Course
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" style="z-index: 9999;"></div>
  `;

  const modalContainer = document.createElement('div');
  modalContainer.id = 'ws-ai-simple-modal';
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);

  // Add event listeners
  const instructionsTextarea = document.getElementById('ws-ai-instructions');
  const charCount = document.getElementById('ws-ai-char-count');
  const submitBtn = document.getElementById('ws-ai-submit');

  instructionsTextarea.addEventListener('input', function() {
    charCount.textContent = this.value.length;
  });

  submitBtn.addEventListener('click', function() {
    handleSimpleFormSubmit(courseId, onSuccess, onError);
  });

  // Store close function globally
  window.WSAIAssistant = window.WSAIAssistant || {};
  window.WSAIAssistant.closeCourseGenerationModal = () => {
    const container = document.getElementById('ws-ai-simple-modal');
    if (container) {
      container.remove();
    }
    onClose();
  };
}

function handleSimpleFormSubmit(courseId, onSuccess, onError) {
  const fileInput = document.getElementById('ws-ai-file');
  const modelSelect = document.getElementById('ws-ai-model');
  const instructionsTextarea = document.getElementById('ws-ai-instructions');
  const submitBtn = document.getElementById('ws-ai-submit');
  const progressDiv = document.getElementById('ws-ai-progress');
  const progressBar = document.getElementById('ws-ai-progress-bar');
  const statusText = document.getElementById('ws-ai-status');
  const errorDiv = document.getElementById('ws-ai-error');

  const file = fileInput.files[0];
  const instructions = instructionsTextarea.value.trim();
  const model = modelSelect.value;

  if (!file || !instructions) {
    showSimpleError('Please fill in all required fields');
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    showSimpleError('File size must be less than 50MB');
    return;
  }

  // Show progress
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating...';
  progressDiv.style.display = 'block';
  errorDiv.style.display = 'none';

  // Upload file
  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/ai-assistant/upload/', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': getCsrfToken()
    }
  })
  .then(response => response.json())
  .then(uploadResult => {
    if (uploadResult.error) throw new Error(uploadResult.error);

    // Create generation job
    return fetch(`/api/ai-assistant/generate/${courseId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        job_type: 'course_generation',
        instructions: instructions,
        pdf_file: uploadResult.file_id,
        model_config: {
          model: model,
          provider: 'openai'
        }
      })
    });
  })
  .then(response => response.json())
  .then(jobResult => {
    if (jobResult.error) throw new Error(jobResult.error);

    statusText.textContent = 'Processing...';
    startSimplePolling(jobResult.id, progressBar, statusText, onSuccess, onError);
  })
  .catch(error => {
    showSimpleError(error.message);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="fa fa-magic" style="margin-right: 6px;"></span>Generate Course';
  });

  function showSimpleError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function startSimplePolling(jobId, progressBar, statusText, onSuccess, onError) {
  const pollInterval = setInterval(() => {
    fetch(`/api/ai-assistant/jobs/${jobId}/`, {
      credentials: 'same-origin',
      headers: {
        'X-CSRFToken': getCsrfToken()
      }
    })
    .then(response => response.json())
    .then(jobData => {
      const progress = jobData.progress_percent || 0;
      progressBar.style.width = progress + '%';
      statusText.textContent = `${progress}% - ${jobData.status}`;

      if (jobData.status === 'completed') {
        clearInterval(pollInterval);
        onSuccess({
          jobId: jobData.id,
          message: 'Course generation completed successfully!',
          jobData: jobData
        });
      } else if (jobData.status === 'failed') {
        clearInterval(pollInterval);
        onError(new Error(jobData.error_message || 'Course generation failed'));
      }
    })
    .catch(error => {
      console.error('Polling error:', error);
    });
  }, 2000);
}

function getCsrfToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') return value;
  }
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

function getCourseIdFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/course\/([^/]+)/);
  return match ? match[1] : null;
}

// Legacy fallback for non-MFE environments (no longer needed since Studio uses authoring MFE)
// Keeping minimal implementation for backwards compatibility
function initializeWSAIAssistant() {
  console.log('WSAIAssistant initialized - using MFE plugin slots for modern Studio integration');
}

// Expose globally for Tutor plugin integration
if (typeof window !== 'undefined') {
  window.WSAIAssistant = window.WSAIAssistant || {};
  window.WSAIAssistant.openCourseGenerationModal = openCourseGenerationModal;
  window.WSAIAssistant.CourseGenerationModal = CourseGenerationModal;
  window.WSAIAssistant.CourseGenerationButton = CourseGenerationButton;
  window.WSAIAssistant.initialize = initializeWSAIAssistant;
  
  // Auto-initialize
  initializeWSAIAssistant();
}
