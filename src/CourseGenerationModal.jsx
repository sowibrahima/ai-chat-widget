import React, { useState, useEffect } from 'react';
import { useCourseGeneration } from './data/hooks';
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
  onSuccess = () => {},
  onError = () => {},
  title = "AI Course Generation",
  maxFileSizeMB = 50,
  courseId = null,
  availableModels = [
    { id: 'gpt-4o', name: 'GPT-4o (Recommended)', description: 'Best quality, slower' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, good quality' }
  ]
}) {
  const { uploadFile, createGenerationJob, getJobStatus, isLoading, error: hookError } = useCourseGeneration();
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [selectedModel, setSelectedModel] = useState(availableModels[0]?.id || 'gpt-4o');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');

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

  // Job polling effect
  useEffect(() => {
    if (!currentJob) return;

    const pollJob = async () => {
      try {
        const jobData = await getJobStatus(currentJob.id);
        setJobProgress(jobData.progress_percent || 0);
        setJobStatus(jobData.status);

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
    if (!file || !instructions.trim()) {
      setError('Please select a PDF file and provide instructions.');
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
      // First upload the file
      const uploadResult = await uploadFile(file);
      
      // Then create the generation job
      const jobData = await createGenerationJob({
        course_id: courseId,
        job_type: 'course_generation',
        instructions: instructions.trim(),
        pdf_file: uploadResult.file_id,
        model_config: {
          model: selectedModel,
          provider: 'openai'
        }
      });

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
              <label htmlFor="model-select" className="form-label">
                AI Model:
              </label>
              <select
                id="model-select"
                className="form-control"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isGenerating}
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
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
                maxLength={1000}
              />
              <div className="character-count">
                {instructions.length}/1000 characters
              </div>
            </div>

            {isGenerating && currentJob && (
              <div className="form-group">
                <label className="form-label">Generation Progress:</label>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${jobProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {jobProgress}% - {jobStatus}
                  </div>
                </div>
              </div>
            )}
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
