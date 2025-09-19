"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CourseGenerationModal;
var _react = _interopRequireWildcard(require("react"));
var _hooks = require("./data/hooks");
require("./AIChatWidget.css");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Minimal SVG icons
const IconClose = _ref => {
  let {
    size = 18,
    ...props
  } = _ref;
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
const IconSpinner = _ref2 => {
  let {
    size = 16,
    ...props
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    className: "spinner",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    style: {
      marginRight: 8
    }
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
const IconFile = _ref3 => {
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
    "aria-hidden": "true",
    style: {
      marginRight: 6,
      verticalAlign: 'text-bottom'
    }
  }, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M14 2v6h6"
  }));
};
const IconWand = _ref4 => {
  let {
    size = 16,
    ...props
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      marginRight: 8
    }
  }, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M15 4l-1 3 3-1"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M6 20l8-8"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M4 15l3 1-1 3"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M18 10l2 2"
  }));
};

/**
 * CourseGenerationModal
 * - Modal component for AI course generation from PDF
 * - Handles file upload and instruction input
 * - Can be used standalone or integrated into other components
 */
function CourseGenerationModal(_ref5) {
  let {
    isOpen = false,
    onClose = () => {},
    onSuccess = () => {},
    onError = () => {},
    title = "AI Course Generation",
    maxFileSizeMB = 50,
    courseId = null
  } = _ref5;
  const {
    uploadFile,
    createGenerationJob,
    getJobStatus,
    isLoading,
    error: hookError
  } = (0, _hooks.useCourseGeneration)();
  const [file, setFile] = (0, _react.useState)(null);
  const [inputType, setInputType] = (0, _react.useState)('file'); // 'file' | 'url' | 'text'
  const [sourceUrl, setSourceUrl] = (0, _react.useState)('');
  const [sourceText, setSourceText] = (0, _react.useState)('');
  const [instructions, setInstructions] = (0, _react.useState)('');
  const [isGenerating, setIsGenerating] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)('');
  const [currentJob, setCurrentJob] = (0, _react.useState)(null);
  const [jobProgress, setJobProgress] = (0, _react.useState)(0);
  const [jobStatus, setJobStatus] = (0, _react.useState)('');
  const [progressMessage, setProgressMessage] = (0, _react.useState)('');
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    setError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type by extension to allow multiple formats
    const allowedExts = ['.pdf', '.docx', '.pptx', '.txt', '.md', '.rtf', '.png', '.jpg', '.jpeg', '.gif'];
    const nameLower = selectedFile.name.toLowerCase();
    const ext = nameLower.substring(nameLower.lastIndexOf('.'));
    if (!allowedExts.includes(ext)) {
      setError(`Unsupported file type: ${ext}. Allowed: ${allowedExts.join(', ')}`);
      setFile(null);
      return;
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setError(`File size must be less than ${maxFileSizeMB}MB. Current size: ${fileSizeMB.toFixed(1)}MB`);
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  // Job polling effect
  (0, _react.useEffect)(() => {
    if (!currentJob) return;
    const pollJob = async () => {
      try {
        const jobData = await getJobStatus(currentJob.id);
        setJobProgress(jobData.progress_percent || 0);
        setJobStatus(jobData.status);
        setProgressMessage(jobData.progress_message || '');
        if (jobData.status === 'completed') {
          setCurrentJob(null);
          setIsGenerating(false);
          onSuccess(jobData);
          handleClose();
        } else if (jobData.status === 'failed') {
          setCurrentJob(null);
          setIsGenerating(false);
          setError(jobData.error_message || 'Course generation failed');
          onError(new Error(jobData.error_message));
        }
      } catch (err) {
        console.error('Error polling job:', err);
      }
    };
    const interval = setInterval(pollJob, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [currentJob, getJobStatus, onSuccess, onError]);
  const handleGenerate = async () => {
    // Basic validation by input type
    if (!instructions.trim()) {
      setError('Please provide instructions.');
      return;
    }
    if (inputType === 'file' && !file) {
      setError('Please select a file.');
      return;
    }
    if (inputType === 'url' && !sourceUrl.trim()) {
      setError('Please provide a source URL.');
      return;
    }
    if (inputType === 'text' && !sourceText.trim()) {
      setError('Please provide some text content.');
      return;
    }
    if (!courseId) {
      setError('Course ID is required for content generation.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setJobProgress(0);
    setJobStatus('starting');
    try {
      let jobPayload = {
        course_id: courseId,
        job_type: 'course_generation',
        instructions: instructions.trim(),
        input_type: inputType
      };
      if (inputType === 'file') {
        // Upload the file first
        const uploadResult = await uploadFile(file);
        jobPayload.file_path = uploadResult.file_path;
        jobPayload.pdf_file = uploadResult.file_path; // back-compat
      } else if (inputType === 'url') {
        jobPayload.source_url = sourceUrl.trim();
      } else if (inputType === 'text') {
        jobPayload.source_text = sourceText.trim();
      }

      // Then create the generation job
      const jobData = await createGenerationJob(jobPayload);
      setCurrentJob(jobData);
      setJobStatus('processing');
    } catch (err) {
      setError(err.message || 'Failed to start course generation. Please try again.');
      setIsGenerating(false);
      onError(err);
    }
  };
  const handleClose = () => {
    if (!isGenerating) {
      setFile(null);
      setInstructions('');
      setError('');
      onClose();
    }
  };
  if (!isOpen) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-overlay"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-header"
  }, /*#__PURE__*/_react.default.createElement("h4", {
    className: "course-generation-modal-title"
  }, title), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "course-generation-modal-close",
    onClick: handleClose,
    disabled: isGenerating,
    "aria-label": "Close modal"
  }, /*#__PURE__*/_react.default.createElement(IconClose, null))), /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-body"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "course-generation-modal-description"
  }, "Provide a source and instructions to generate comprehensive Open edX course content using AI. Supported inputs: PDF, Word (.docx), PowerPoint (.pptx), plaintext (.txt/.md/.rtf), images (.png/.jpg/.jpeg/.gif), or a web page URL."), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-error"
  }, error), /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-form"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    className: "form-label"
  }, "Source Type:"), /*#__PURE__*/_react.default.createElement("div", {
    className: "btn-group",
    role: "group",
    "aria-label": "Source type"
  }, /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: `btn ${inputType === 'file' ? 'btn-primary' : 'btn-outline'}`,
    onClick: () => setInputType('file'),
    disabled: isGenerating
  }, "File"), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: `btn ${inputType === 'url' ? 'btn-primary' : 'btn-outline'}`,
    onClick: () => setInputType('url'),
    disabled: isGenerating
  }, "URL"), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: `btn ${inputType === 'text' ? 'btn-primary' : 'btn-outline'}`,
    onClick: () => setInputType('text'),
    disabled: isGenerating
  }, "Text"))), inputType === 'file' && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "source-upload",
    className: "form-label"
  }, "Upload File (max ", maxFileSizeMB, "MB):"), /*#__PURE__*/_react.default.createElement("input", {
    id: "source-upload",
    type: "file",
    className: "form-control",
    accept: ".pdf,.docx,.pptx,.txt,.md,.rtf,.png,.jpg,.jpeg,.gif",
    onChange: handleFileChange,
    disabled: isGenerating
  }), file && /*#__PURE__*/_react.default.createElement("div", {
    className: "file-info"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "file-name"
  }, /*#__PURE__*/_react.default.createElement(IconFile, null), file.name), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-size"
  }, "(", (file.size / (1024 * 1024)).toFixed(1), "MB)"))), inputType === 'url' && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "source-url",
    className: "form-label"
  }, "Web Page URL:"), /*#__PURE__*/_react.default.createElement("input", {
    id: "source-url",
    type: "url",
    className: "form-control",
    value: sourceUrl,
    onChange: e => setSourceUrl(e.target.value),
    placeholder: "https://example.com/article",
    disabled: isGenerating
  })), inputType === 'text' && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "source-text",
    className: "form-label"
  }, "Paste Text:"), /*#__PURE__*/_react.default.createElement("textarea", {
    id: "source-text",
    className: "form-control",
    rows: "6",
    value: sourceText,
    onChange: e => setSourceText(e.target.value),
    placeholder: "Paste your source text here...",
    disabled: isGenerating
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "instructions",
    className: "form-label"
  }, "Generation Instructions:"), /*#__PURE__*/_react.default.createElement("textarea", {
    id: "instructions",
    className: "form-control",
    rows: "4",
    value: instructions,
    onChange: e => setInstructions(e.target.value),
    placeholder: "Describe what kind of course content you want to generate. For example: 'Create a comprehensive course with modules, lessons, quizzes, and assignments based on this document. Focus on practical applications and include interactive elements.'",
    disabled: isGenerating,
    maxLength: 1000
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "character-count"
  }, instructions.length, "/1000 characters")), isGenerating && currentJob && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    className: "form-label"
  }, "Generation Progress:"), /*#__PURE__*/_react.default.createElement("div", {
    className: "progress-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "progress-bar"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "progress-fill",
    style: {
      width: `${jobProgress}%`
    }
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "progress-text"
  }, jobProgress, "% - ", jobStatus, progressMessage ? ` — ${progressMessage}` : ''))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-footer"
  }, /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleClose,
    disabled: isGenerating
  }, "Cancel"), /*#__PURE__*/_react.default.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: handleGenerate,
    disabled: isGenerating || !instructions.trim() || inputType === 'file' && !file || inputType === 'url' && !sourceUrl.trim() || inputType === 'text' && !sourceText.trim()
  }, isGenerating ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(IconSpinner, null), "Generating...") : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(IconWand, null), "Generate Course")))));
}
//# sourceMappingURL=CourseGenerationModal.js.map