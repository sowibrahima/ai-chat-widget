import React, { useState } from 'react';
import CourseGenerationModal from './CourseGenerationModal';
import './AIChatWidget.css';

/**
 * CourseGenerationButton
 * - Simple button component that opens the course generation modal
 * - Handles the modal state and API calls
 * - Can be easily imported and used in Tutor plugin slots
 */
export default function CourseGenerationButton({
  buttonText = "AI Generate",
  buttonIcon = "🪄",
  buttonClassName = "btn btn-primary",
  apiUrl = "/api/ai-assistant/generation/jobs",
  uploadUrl = "/api/ai-assistant/upload",
  maxFileSizeMB = 50,
  onSuccess = () => {},
  onError = () => {},
}) {
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async ({ file, instructions }) => {
    try {
      // First upload the PDF file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();
      
      // Then create the generation job
      const jobResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          job_type: 'course_creation',
          input_data: {
            file_id: uploadResult.file_id,
            instructions: instructions,
          },
        }),
      });

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json();
        throw new Error(errorData.error || 'Failed to create generation job');
      }

      const jobResult = await jobResponse.json();
      
      // Call success callback
      onSuccess({
        jobId: jobResult.id,
        message: 'Course generation started successfully! You will be notified when it completes.',
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

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setShowModal(true)}
        title="Generate course content with AI"
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
        onGenerate={handleGenerate}
        maxFileSizeMB={maxFileSizeMB}
      />
    </>
  );
}
