import React, { useState } from 'react';
import CourseGenerationModal from './CourseGenerationModal';
import { getCourseIdFromUrl } from './data/hooks';
import './AIChatWidget.css';

// Minimal SVG wand icon
const IconWand = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 8, verticalAlign: 'text-bottom' }} {...props}>
    <path d="M15 4l-1 3 3-1" />
    <path d="M6 20l8-8" />
    <path d="M4 15l3 1-1 3" />
    <path d="M18 10l2 2" />
  </svg>
);

/**
 * CourseGenerationButton
 * - Simple button component that opens the course generation modal
 * - Handles the modal state and callbacks
 * - Can be easily imported and used in Tutor plugin slots
 */
export default function CourseGenerationButton({
  buttonText = "AI Generate",
  buttonIcon = null,
  buttonClassName = "btn btn-primary",
  maxFileSizeMB = 50,
  onSuccess = () => {},
  onError = () => {},
  availableModels = [
    { id: 'gpt-4o', name: 'GPT-4o (Recommended)', description: 'Best quality, slower' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, good quality' }
  ]
}) {
  const [showModal, setShowModal] = useState(false);
  const courseId = getCourseIdFromUrl();

  const handleSuccess = (jobData) => {
    onSuccess({
      jobId: jobData.id,
      message: 'Course generation completed successfully!',
      jobData: jobData
    });
  };

  const handleError = (error) => {
    console.error('Course generation error:', error);
    onError(error);
  };

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setShowModal(true)}
        disabled={!courseId}
        title={!courseId ? "Course context required" : "Generate course content with AI"}
        aria-label="Generate course content with AI"
      >
        <span className="icon" style={{ marginRight: '8px' }}>
          {React.isValidElement(buttonIcon) ? buttonIcon : <IconWand />}
        </span>
        {buttonText}
      </button>

      <CourseGenerationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        onError={handleError}
        courseId={courseId}
        maxFileSizeMB={maxFileSizeMB}
        availableModels={availableModels}
      />
    </>
  );
}
