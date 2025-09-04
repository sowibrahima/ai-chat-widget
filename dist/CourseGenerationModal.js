"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CourseGenerationModal;
var _react = _interopRequireWildcard(require("react"));
require("./AIChatWidget.css");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * CourseGenerationModal
 * - Modal component for AI course generation from PDF
 * - Handles file upload and instruction input
 * - Can be used standalone or integrated into other components
 */
function CourseGenerationModal(_ref) {
  let {
    isOpen = false,
    onClose = () => {},
    onGenerate = () => {},
    title = "AI Course Generation",
    maxFileSizeMB = 50
  } = _ref;
  const [file, setFile] = (0, _react.useState)(null);
  const [instructions, setInstructions] = (0, _react.useState)('');
  const [isGenerating, setIsGenerating] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)('');
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    setError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file.');
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
  const handleGenerate = async () => {
    if (!file || !instructions.trim()) {
      setError('Please select a PDF file and provide instructions.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      await onGenerate({
        file,
        instructions: instructions.trim()
      });
      // Reset form on success
      setFile(null);
      setInstructions('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate course content. Please try again.');
    } finally {
      setIsGenerating(false);
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
  }, "\u2715")), /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-body"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "course-generation-modal-description"
  }, "Upload a PDF document and provide instructions to generate comprehensive course content using AI."), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-modal-error"
  }, error), /*#__PURE__*/_react.default.createElement("div", {
    className: "course-generation-form"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "pdf-upload",
    className: "form-label"
  }, "PDF Document (max ", maxFileSizeMB, "MB):"), /*#__PURE__*/_react.default.createElement("input", {
    id: "pdf-upload",
    type: "file",
    className: "form-control",
    accept: ".pdf",
    onChange: handleFileChange,
    disabled: isGenerating
  }), file && /*#__PURE__*/_react.default.createElement("div", {
    className: "file-info"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "file-name"
  }, "\uD83D\uDCC4 ", file.name), /*#__PURE__*/_react.default.createElement("span", {
    className: "file-size"
  }, "(", (file.size / (1024 * 1024)).toFixed(1), "MB)"))), /*#__PURE__*/_react.default.createElement("div", {
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
    disabled: isGenerating
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "character-count"
  }, instructions.length, "/1000 characters")))), /*#__PURE__*/_react.default.createElement("div", {
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
    disabled: !file || !instructions.trim() || isGenerating
  }, isGenerating ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
    className: "spinner"
  }, "\u23F3"), "Generating...") : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
    className: "icon"
  }, "\uD83E\uDE84"), "Generate Course")))));
}
//# sourceMappingURL=CourseGenerationModal.js.map