import React, { useState } from 'react';
import CourseGenerationModal from './CourseGenerationModal';
import { getCourseIdFromUrl } from './data/hooks';
import './AIChatWidget.css';

/**
 * CourseGenerationButton
 * - Simple button component that opens the course generation modal
 * - Handles the modal state and callbacks
 * - Can be easily imported and used in Tutor plugin slots
 */
export default function CourseGenerationButton({
  buttonText = "AI Generate",
  buttonIcon = "🪄",
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
          {buttonIcon}
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
