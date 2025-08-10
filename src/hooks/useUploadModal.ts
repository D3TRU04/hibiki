'use client';

import { useState } from 'react';
import { Post, UploadFormData, CreatePostData } from '@/lib/types';
import { createPost } from '@/lib/api';
import { authService } from '@/lib/auth';

export function useUploadModal() {
  const [formData, setFormData] = useState<UploadFormData>({
    text: '',
    videoFile: undefined,
    honeypot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev: UploadFormData) => ({ ...prev, text: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setFormData((prev: UploadFormData) => ({ 
        ...prev, 
        videoFile: file
      }));
      setError(null);
    } else {
      setError('Please select a video file');
    }
  };

  const handleSubmit = async (
    e: React.FormEvent, 
    lat: number, 
    lng: number, 
    onPostCreated: (post: Post) => void
  ) => {
    e.preventDefault();
    
    // Check authentication
    const user = await authService.getCurrentUser();
    if (!user) {
      setError('Please sign in to share stories');
      return;
    }

    if (!formData.text.trim()) {
      setError('Please enter a story');
      return;
    }

    // Check honeypot
    if (formData.honeypot) {
      setError('Spam detected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const postData: CreatePostData = {
        text: formData.text.trim(),
        lat,
        lng,
        mediaFile: formData.videoFile,
        content_type: formData.videoFile ? 'media' : 'news',
        newsUrl: undefined,
      };

      const newPost = await createPost(postData);

      if (newPost) {
        onPostCreated(newPost);
        handleClose();
      } else {
        setError('Failed to create post');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting your story';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      text: '', 
      videoFile: undefined, 
      honeypot: '' 
    });
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