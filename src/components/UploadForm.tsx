'use client';

import { UploadFormData } from '@/lib/types';
import { Video, FileText, MapPin } from 'lucide-react';

interface UploadFormProps {
  formData: UploadFormData;
  isSubmitting: boolean;
  error: string | null;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  locationContext?: string;
}

export default function UploadForm({
  formData,
  isSubmitting,
  error,
  onTextChange,
  onFileChange,
  onSubmit,
  onCancel,
  locationContext
}: UploadFormProps) {
  const getPlaceholder = () => {
    if (locationContext) {
      return `Share your story about ${locationContext}... What happened here? What makes this place special?`;
    }
    return "Share your story, memory, or experience from this location... What makes this place meaningful to you?";
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Story Text Input */}
      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
          Your Story *
        </label>
        <div className="relative">
          <textarea
            id="story"
            value={formData.text}
            onChange={onTextChange}
            placeholder={getPlaceholder()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            rows={4}
            required
          />
          {locationContext && (
            <div className="absolute top-2 right-2">
              <MapPin className="w-4 h-4 text-gold" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Share what makes this location special to you. Include memories, experiences, or what you love about this place.
        </p>
      </div>

      {/* Story Prompts */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-800 mb-2">Story Ideas:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• What&apos;s your favorite memory from this place?</li>
          <li>• What makes this location unique or special?</li>
          <li>• Share a personal experience or encounter here</li>
          <li>• What would you tell someone visiting for the first time?</li>
        </ul>
      </div>

      {/* Media Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Upload (Optional)
        </label>
        <div className="space-y-3">
          {/* Video Upload */}
          <div className="flex items-center space-x-3">
            <label
              htmlFor="video"
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <Video className="w-4 h-4 mr-2 text-gray-600" />
              Video Recording
            </label>
            <input
              id="video"
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
            {formData.videoFile && (
              <span className="text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {formData.videoFile.name}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Supported: MP4, MOV
        </p>
      </div>

      {/* Honeypot field (hidden) */}
      <input
        type="text"
        name="honeypot"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

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
          className="flex-1 px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sharing...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Share Story
            </>
          )}
        </button>
      </div>
    </form>
  );
} 