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
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Minimal SVG wand icon
const IconWand = _ref => {
  let {
    size = 16,
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
    "aria-hidden": "true",
    style: {
      marginRight: 8,
      verticalAlign: 'text-bottom'
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
 * CourseGenerationButton
 * - Simple button component that opens the course generation modal
 * - Handles the modal state and callbacks
 * - Can be easily imported and used in Tutor plugin slots
 */
function CourseGenerationButton(_ref2) {
  let {
    buttonText = "Générer avec IA",
    buttonIcon = null,
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
  } = _ref2;
  const [showModal, setShowModal] = (0, _react.useState)(false);
  const courseId = (0, _hooks.getCourseIdFromUrl)();
  const handleSuccess = jobData => {
    onSuccess({
      jobId: jobData.id,
      message: 'Génération du cours terminée avec succès!',
      jobData: jobData
    });
  };
  const handleError = error => {
    console.error('Erreur de génération du cours:', error);
    onError(error);
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("button", {
    className: buttonClassName,
    onClick: () => setShowModal(true),
    disabled: !courseId,
    title: !courseId ? "Contexte du cours requis" : "Générer avec IA",
    "aria-label": "G\xE9n\xE9rer avec IA"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "icon",
    style: {
      marginRight: '8px'
    }
  }, /*#__PURE__*/_react.default.isValidElement(buttonIcon) ? buttonIcon : /*#__PURE__*/_react.default.createElement(IconWand, null)), buttonText), /*#__PURE__*/_react.default.createElement(_CourseGenerationModal.default, {
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