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
 * - Handles the modal state and callbacks
 * - Can be easily imported and used in Tutor plugin slots
 */
function CourseGenerationButton(_ref) {
  let {
    buttonText = "AI Generate",
    buttonIcon = "🪄",
    buttonClassName = "btn btn-primary",
    maxFileSizeMB = 50,
    onSuccess = () => {},
    onError = () => {},
    availableModels = [{
      id: 'gpt-4o',
      name: 'GPT-4o (Recommended)',
      description: 'Best quality, slower'
    }, {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Faster, good quality'
    }]
  } = _ref;
  const [showModal, setShowModal] = (0, _react.useState)(false);
  const courseId = (0, _hooks.getCourseIdFromUrl)();
  const handleSuccess = jobData => {
    onSuccess({
      jobId: jobData.id,
      message: 'Course generation completed successfully!',
      jobData: jobData
    });
  };
  const handleError = error => {
    console.error('Course generation error:', error);
    onError(error);
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("button", {
    className: buttonClassName,
    onClick: () => setShowModal(true),
    disabled: !courseId,
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
    onSuccess: handleSuccess,
    onError: handleError,
    courseId: courseId,
    maxFileSizeMB: maxFileSizeMB,
    availableModels: availableModels
  }));
}
//# sourceMappingURL=CourseGenerationButton.js.map