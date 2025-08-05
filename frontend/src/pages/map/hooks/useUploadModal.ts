import { useState } from 'react';
import { Post, UploadFormData } from '../../../types/backend';
import { PostController } from '../../../services/api';

export function useUploadModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<UploadFormData>({
    text: '',
    audioFile: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev: UploadFormData) => ({ ...prev, text: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setFormData((prev: UploadFormData) => ({ ...prev, audioFile: file }));
      setError(null);
    } else if (file) {
      setError('Please select an audio file');
    }
  };

  const handleSubmit = async (e: React.FormEvent, onPostCreated: (post: Post) => void) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setError('Please enter a story');
      return;
    }

    if (!selectedLocation) {
      setError('No location selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create post with audio file
      const newPost = await PostController.createPost(
        {
          text: formData.text.trim(),
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
        formData.audioFile
      );

      if (newPost) {
        onPostCreated(newPost);
        handleClose();
      } else {
        setError('Failed to create post');
      }
    } catch {
      setError('An error occurred while submitting your story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ text: '', audioFile: undefined });
    setError(null);
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  const openModal = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    selectedLocation,
    formData,
    isSubmitting,
    error,
    handleTextChange,
    handleFileChange,
    handleSubmit,
    handleClose,
    openModal,
  };
} 