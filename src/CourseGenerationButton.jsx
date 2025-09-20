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
  buttonText = "Générer avec IA",
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
      message: 'Génération du cours terminée avec succès!',
      jobData: jobData
    });
  };

  const handleError = (error) => {
    console.error('Erreur de génération du cours:', error);
    onError(error);
  };

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setShowModal(true)}
        disabled={!courseId}
        title={!courseId ? "Contexte du cours requis" : "Générer avec IA"}
        aria-label="Générer avec IA"
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
