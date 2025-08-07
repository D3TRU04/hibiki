'use client';

import { useState, useRef } from 'react';
import { X, Upload, Tag, MapPin, Send, Image, Video, Music, Star } from 'lucide-react';
import { KleoPost } from '@/lib/types';
import { createKleoPost } from '@/lib/api';
import { useWallet } from '@/lib/identity';
import { calculateRewardPoints } from '@/lib/rewards';

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPostCreated: (post: KleoPost) => void;
}

interface FormData {
  text: string;
  mediaFile?: File;
  tags: string[];
  contributor_id?: string;
}

export default function SubmissionForm({
  isOpen,
  onClose,
  lat,
  lng,
  onPostCreated
}: SubmissionFormProps) {
  const wallet = useWallet();
  const [formData, setFormData] = useState<FormData>({
    text: '',
    tags: [],
    contributor_id: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, text: e.target.value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/', 'image/', 'video/'];
      if (!validTypes.some(type => file.type.startsWith(type))) {
        setError('Please select a valid audio, image, or video file.');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }

      setFormData(prev => ({ ...prev, mediaFile: file }));
      setError(null);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError('Please enter your story.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setEarnedPoints(null);

    try {
      const post = await createKleoPost({
        text: formData.text.trim(),
        lat,
        lng,
        mediaFile: formData.mediaFile,
        tags: formData.tags,
        contributor_id: formData.contributor_id,
        wallet: wallet.isConnected ? wallet : undefined
      });

      if (post) {
        // Show earned points
        if (post.reward_points && post.reward_points > 0) {
          setEarnedPoints(post.reward_points);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setEarnedPoints(null);
            handleClose();
          }, 3000);
        } else {
          handleClose();
        }
        
        onPostCreated(post);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      
      // Provide more specific error messages
      if (errorMessage.includes('IPFS')) {
        setError('Failed to upload to IPFS. Please check your connection and try again.');
      } else if (errorMessage.includes('wallet')) {
        setError('Wallet connection issue. Please reconnect your wallet and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ text: '', tags: [], contributor_id: undefined });
    setTagInput('');
    setError(null);
    setIsSubmitting(false);
    setEarnedPoints(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getMediaTypeIcon = () => {
    if (!formData.mediaFile) return <Upload className="w-4 h-4" />;
    
    if (formData.mediaFile.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (formData.mediaFile.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (formData.mediaFile.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <Upload className="w-4 h-4" />;
  };

  // Calculate potential points
  const potentialPoints = calculateRewardPoints({
    text: formData.text,
    media_type: formData.mediaFile ? 
      (formData.mediaFile.type.startsWith('image/') ? 'image' : 
       formData.mediaFile.type.startsWith('video/') ? 'video' : 
       formData.mediaFile.type.startsWith('audio/') ? 'audio' : undefined) : undefined,
    tags: formData.tags,
    wallet_type: wallet.isConnected ? wallet.type : undefined
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">K</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Share Your Story</h2>
            </div>
            
            {/* Location */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>

            {/* Wallet Status */}
            {wallet.isConnected && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gold">
                <Star className="w-4 h-4" />
                <span>Connected • {potentialPoints} XP potential</span>
              </div>
            )}
          </div>

          {/* Success Message */}
          {earnedPoints && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Story Shared Successfully!</p>
                  <p className="text-green-700 text-sm">You earned {earnedPoints} Cookie Points! 🎉</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Story Text */}
            <div>
              <label htmlFor="story-text" className="block text-sm font-medium text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                id="story-text"
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Share what happened here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="media-file" className="block text-sm font-medium text-gray-700 mb-2">
                Media (Optional)
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="media-file"
                  accept="audio/*,image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {getMediaTypeIcon()}
                    <span className="text-gray-600">
                      {formData.mediaFile ? formData.mediaFile.name : 'Click to upload audio, image, or video'}
                    </span>
                  </div>
                </button>
              </div>
              {formData.mediaFile && (
                <div className="mt-2 text-sm text-gray-500">
                  File: {formData.mediaFile.name} ({(formData.mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Add tags (e.g., #conflict, #dailyLife, #music)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gold text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                
                {/* Tag Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.text.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gold text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading to IPFS...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Share Story</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 