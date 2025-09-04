import React, { useState } from 'react';
import './AIChatWidget.css';

/**
 * CourseGenerationModal
 * - Modal component for AI course generation from PDF
 * - Handles file upload and instruction input
 * - Can be used standalone or integrated into other components
 */
export default function CourseGenerationModal({
  isOpen = false,
  onClose = () => {},
  onGenerate = () => {},
  title = "AI Course Generation",
  maxFileSizeMB = 50,
}) {
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
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
        instructions: instructions.trim(),
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

  return (
    <div className="course-generation-modal-overlay">
      <div className="course-generation-modal">
        <div className="course-generation-modal-header">
          <h4 className="course-generation-modal-title">{title}</h4>
          <button
            type="button"
            className="course-generation-modal-close"
            onClick={handleClose}
            disabled={isGenerating}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="course-generation-modal-body">
          <p className="course-generation-modal-description">
            Upload a PDF document and provide instructions to generate comprehensive course content using AI.
          </p>

          {error && (
            <div className="course-generation-modal-error">
              {error}
            </div>
          )}

          <div className="course-generation-form">
            <div className="form-group">
              <label htmlFor="pdf-upload" className="form-label">
                PDF Document (max {maxFileSizeMB}MB):
              </label>
              <input
                id="pdf-upload"
                type="file"
                className="form-control"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isGenerating}
              />
              {file && (
                <div className="file-info">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-size">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="instructions" className="form-label">
                Generation Instructions:
              </label>
              <textarea
                id="instructions"
                className="form-control"
                rows="4"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe what kind of course content you want to generate. For example: 'Create a comprehensive course with modules, lessons, quizzes, and assignments based on this document. Focus on practical applications and include interactive elements.'"
                disabled={isGenerating}
              />
              <div className="character-count">
                {instructions.length}/1000 characters
              </div>
            </div>
          </div>
        </div>

        <div className="course-generation-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!file || !instructions.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span className="icon">🪄</span>
                Generate Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
