'use client';

import { X } from 'lucide-react';
import { Post } from '../../../types/backend';
import { useUploadModal } from '../hooks/useUploadModal';
import UploadForm from './UploadForm';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPostCreated: (post: Post) => void;
}

export default function UploadModal({ isOpen, onClose, onPostCreated }: UploadModalProps) {
  const {
    formData,
    isSubmitting,
    error,
    handleTextChange,
    handleFileChange,
    handleSubmit,
    handleClose,
  } = useUploadModal();

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, onPostCreated);
  };

  const handleModalClose = () => {
    handleClose();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Your Story</h2>
          <button
            onClick={handleModalClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <UploadForm
          formData={formData}
          isSubmitting={isSubmitting}
          error={error}
          onTextChange={handleTextChange}
          onFileChange={handleFileChange}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </div>
    </div>
  );
} 