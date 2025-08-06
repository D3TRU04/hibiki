'use client';

import { UploadFormData } from '@/lib/types';

interface UploadFormProps {
  formData: UploadFormData;
  isSubmitting: boolean;
  error: string | null;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function UploadForm({
  formData,
  isSubmitting,
  error,
  onTextChange,
  onFileChange,
  onSubmit,
  onCancel,
}: UploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Story Text Input */}
      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
          Your Story *
        </label>
        <textarea
          id="story"
          value={formData.text}
          onChange={onTextChange}
          placeholder="Share your story, memory, or experience from this location..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          required
        />
      </div>

      {/* Audio File Upload */}
      <div>
        <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
          Audio Recording (Optional)
        </label>
        <div className="flex items-center space-x-3">
          <label
            htmlFor="audio"
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose Audio File
          </label>
          <input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            className="hidden"
          />
          {formData.audioFile && (
            <span className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {formData.audioFile.name}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: MP3, WAV, M4A, OGG
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.text.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sharing...
            </>
          ) : (
            'Share Story'
          )}
        </button>
      </div>
    </form>
  );
} 