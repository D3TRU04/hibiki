'use client';

import { Upload, Mic } from 'lucide-react';

interface UploadFormProps {
  formData: {
    text: string;
    audioFile?: File;
  };
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
      {/* Story Text */}
      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
          Share your story
        </label>
        <textarea
          id="story"
          value={formData.text}
          onChange={onTextChange}
          placeholder="Tell us about this place..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          required
        />
      </div>

      {/* Audio Upload */}
      <div>
        <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
          Add audio (optional)
        </label>
        <div className="flex items-center space-x-3">
          <label
            htmlFor="audio"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Mic size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {formData.audioFile ? formData.audioFile.name : 'Choose audio file'}
            </span>
          </label>
          <input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
        {formData.audioFile && (
          <p className="text-xs text-green-600 mt-1">
            ✓ {formData.audioFile.name} selected
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Submit Story</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
} 