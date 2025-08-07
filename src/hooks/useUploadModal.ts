'use client';

import { useState } from 'react';
import { Post, UploadFormData, CreatePostData } from '@/lib/types';
import { createPost } from '@/lib/api';
import { authService } from '@/lib/auth';

export function useUploadModal() {
  const [formData, setFormData] = useState<UploadFormData>({
    text: '',
    audioFile: undefined,
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

    // Clear other file types when one is selected
    if (e.target.id === 'audio') {
      if (file.type.startsWith('audio/')) {
        setFormData((prev: UploadFormData) => ({ 
          ...prev, 
          audioFile: file, 
          videoFile: undefined 
        }));
        setError(null);
      } else {
        setError('Please select an audio file');
      }
    } else if (e.target.id === 'video') {
      if (file.type.startsWith('video/')) {
        setFormData((prev: UploadFormData) => ({ 
          ...prev, 
          videoFile: file, 
          audioFile: undefined 
        }));
        setError(null);
      } else {
        setError('Please select a video file');
      }
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
        type: formData.videoFile ? 'video' : (formData.audioFile ? 'audio' : 'text'),
        content: formData.text.trim(),
        lat,
        lng,
        mediaFile: formData.videoFile || formData.audioFile,
        honeypot: formData.honeypot,
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
      audioFile: undefined, 
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