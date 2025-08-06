'use client';

import { useState } from 'react';
import { Post, UploadFormData } from '@/lib/types';
import { createPost } from '@/lib/api';

export function useUploadModal() {
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

  const handleSubmit = async (
    e: React.FormEvent, 
    lat: number, 
    lng: number, 
    onPostCreated: (post: Post) => void
  ) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setError('Please enter a story');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newPost = await createPost(
        {
          text: formData.text.trim(),
          lat,
          lng,
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
  };

  return {
    formData,
    isSubmitting,
    error,
    handleTextChange,
    handleFileChange,
    handleSubmit,
    handleClose,
  };
} 