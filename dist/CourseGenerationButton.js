"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CourseGenerationButton;
var _react = _interopRequireWildcard(require("react"));
var _CourseGenerationModal = _interopRequireDefault(require("./CourseGenerationModal"));
var _hooks = require("./data/hooks");
require("./AIChatWidget.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * CourseGenerationButton
 * - Simple button component that opens the course generation modal
 * - Handles the modal state and API calls
 * - Can be easily imported and used in Tutor plugin slots
 */
function CourseGenerationButton(_ref) {
  let {
    buttonText = "AI Generate",
    buttonIcon = "🪄",
    buttonClassName = "btn btn-primary",
    uploadUrl = "/api/ai-assistant/upload",
    maxFileSizeMB = 50,
    onSuccess = () => {},
    onError = () => {}
  } = _ref;
  const [showModal, setShowModal] = (0, _react.useState)(false);
  const {
    generateCourse,
    isLoading
  } = (0, _hooks.useCourseGeneration)();
  const courseId = (0, _hooks.getCourseIdFromUrl)();
  const handleGenerate = async _ref2 => {
    let {
      file,
      instructions
    } = _ref2;
    if (!courseId) {
      const error = new Error('No course context found. Please make sure you are on a course page.');
      onError(error);
      throw error;
    }
    try {
      // First upload the PDF file
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'X-CSRFToken': getCsrfToken()
        }
      });
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      const uploadResult = await uploadResponse.json();

      // Then create the generation job using the dynamic course-aware endpoint
      const jobData = {
        job_type: 'course_creation',
        input_data: {
          file_id: uploadResult.file_id,
          instructions: instructions
        }
      };
      const jobResult = await generateCourse(courseId, jobData);

      // Call success callback
      onSuccess({
        jobId: jobResult.id,
        message: 'Course generation started successfully! You will be notified when it completes.'
      });
    } catch (error) {
      console.error('Course generation error:', error);
      onError(error);
      throw error; // Re-throw so modal can handle it
    }
  };

  // Helper function to get CSRF token
  const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    // Fallback: try to get from meta tag
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    return csrfMeta ? csrfMeta.getAttribute('content') : '';
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("button", {
    className: buttonClassName,
    onClick: () => setShowModal(true),
    disabled: !courseId || isLoading,
    title: !courseId ? "Course context required" : "Generate course content with AI",
    "aria-label": "Generate course content with AI"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "icon",
    style: {
      marginRight: '8px'
    }
  }, buttonIcon), buttonText), /*#__PURE__*/_react.default.createElement(_CourseGenerationModal.default, {
    isOpen: showModal,
    onClose: () => setShowModal(false),
    onGenerate: handleGenerate,
    maxFileSizeMB: maxFileSizeMB
  }));
}
//# sourceMappingURL=CourseGenerationButton.js.map