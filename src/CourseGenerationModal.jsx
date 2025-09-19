import React, { useState, useEffect } from 'react';
import { useCourseGeneration } from './data/hooks';
import './AIChatWidget.css';

// Minimal SVG icons
const IconClose = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconSpinner = ({ size = 16, ...props }) => (
  <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ marginRight: 8 }} {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
  </svg>
);
const IconFile = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'text-bottom' }} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);
const IconWand = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 8 }} {...props}>
    <path d="M15 4l-1 3 3-1" />
    <path d="M6 20l8-8" />
    <path d="M4 15l3 1-1 3" />
    <path d="M18 10l2 2" />
  </svg>
);

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
  courseId = null
}) {
  const { uploadFile, createGenerationJob, getJobStatus, isLoading, error: hookError } = useCourseGeneration();
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState('file'); // 'file' | 'url' | 'text'
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = (e) => {
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
  useEffect(() => {
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
        input_type: inputType,
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
            <IconClose />
          </button>
        </div>

        <div className="course-generation-modal-body">
          <p className="course-generation-modal-description">
            Provide a source and instructions to generate comprehensive Open edX course content using AI. Supported inputs: PDF, Word (.docx), PowerPoint (.pptx), plaintext (.txt/.md/.rtf), images (.png/.jpg/.jpeg/.gif), or a web page URL.
          </p>

          {error && (
            <div className="course-generation-modal-error">
              {error}
            </div>
          )}

          <div className="course-generation-form">
            {/* Input type selector */}
            <div className="form-group">
              <label className="form-label">Source Type:</label>
              <div className="btn-group" role="group" aria-label="Source type">
                <button type="button" className={`btn ${inputType==='file' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputType('file')} disabled={isGenerating}>File</button>
                <button type="button" className={`btn ${inputType==='url' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputType('url')} disabled={isGenerating}>URL</button>
                <button type="button" className={`btn ${inputType==='text' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputType('text')} disabled={isGenerating}>Text</button>
              </div>
            </div>
            {inputType === 'file' && (
              <div className="form-group">
                <label htmlFor="source-upload" className="form-label">
                  Upload File (max {maxFileSizeMB}MB):
                </label>
                <input
                  id="source-upload"
                  type="file"
                  className="form-control"
                  accept=".pdf,.docx,.pptx,.txt,.md,.rtf,.png,.jpg,.jpeg,.gif"
                  onChange={handleFileChange}
                  disabled={isGenerating}
                />
                {file && (
                  <div className="file-info">
                    <span className="file-name"><IconFile />{file.name}</span>
                    <span className="file-size">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                  </div>
                )}
              </div>
            )}

            {inputType === 'url' && (
              <div className="form-group">
                <label htmlFor="source-url" className="form-label">Web Page URL:</label>
                <input
                  id="source-url"
                  type="url"
                  className="form-control"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  disabled={isGenerating}
                />
              </div>
            )}

            {inputType === 'text' && (
              <div className="form-group">
                <label htmlFor="source-text" className="form-label">Paste Text:</label>
                <textarea
                  id="source-text"
                  className="form-control"
                  rows="6"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your source text here..."
                  disabled={isGenerating}
                />
              </div>
            )}

            

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
                    {jobProgress}% - {jobStatus}{progressMessage ? ` — ${progressMessage}` : ''}
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
            disabled={
              isGenerating ||
              !instructions.trim() ||
              (inputType === 'file' && !file) ||
              (inputType === 'url' && !sourceUrl.trim()) ||
              (inputType === 'text' && !sourceText.trim())
            }
          >
            {isGenerating ? (
              <>
                <IconSpinner />Generating...
              </>
            ) : (
              <>
                <IconWand />Generate Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
