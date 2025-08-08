'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, MapPin, Send, Video, Star, AlertCircle, Link, Clock, Shield, AlertTriangle, Coins } from 'lucide-react';
import { KleoPost, Wallet } from '@/lib/types';
import { createKleoPost } from '@/lib/api';
import { calculateRewardPoints } from '@/lib/rewards';
import { rateLimiterService } from '@/lib/rate-limiter';
import { fakeNewsDetectorService } from '@/lib/fake-news-detector';

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPostCreated: (post: KleoPost) => void;
  wallet?: Wallet | null;
}

interface FormData {
  text: string;
  mediaFile?: File;
  newsUrl?: string;
  contributor_id?: string;
  content_type: 'media' | 'news';
}

export default function SubmissionForm({
  isOpen,
  onClose,
  lat,
  lng,
  onPostCreated,
  wallet
}: SubmissionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    text: '',
    contributor_id: undefined,
    content_type: 'media'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [nftMinted, setNftMinted] = useState<{ tokenId?: string; transactionHash?: string } | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ canPost: boolean; timeRemaining: number }>({ canPost: true, timeRemaining: 0 });
  const [credibilityInfo, setCredibilityInfo] = useState<{ score: number; isReliable: boolean; reasons: string[] } | null>(null);
  const [isCheckingCredibility, setIsCheckingCredibility] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authenticated
  const isAuthenticated = wallet && wallet.isConnected;

  // Check rate limiting
  useEffect(() => {
    if (wallet?.address) {
      const info = rateLimiterService.canPost(wallet.address);
      setRateLimitInfo(info);
    }
  }, [wallet?.address]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, text: e.target.value }));
    setError(null);
  };

  const handleContentTypeChange = (type: 'media' | 'news') => {
    setFormData(prev => ({ 
      ...prev, 
      content_type: type,
      mediaFile: undefined,
      newsUrl: undefined
    }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only support video files for MVP
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file.');
        return;
      }

      // Enhanced video validation
      if (file.size > 5 * 1024 * 1024) {
        setError('Video file size must be less than 5MB.');
        return;
      }

      // Check video file type
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        setError('Please select a supported video format (MP4, WebM, OGG, or MOV).');
        return;
      }

      setFormData(prev => ({ ...prev, mediaFile: file, newsUrl: undefined }));
      setError(null);
    }
  };

  const handleNewsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, newsUrl: url, mediaFile: undefined }));
    setError(null);
    setCredibilityInfo(null);
    
    // Check credibility if URL is valid
    if (url && validateNewsUrl(url)) {
      checkNewsCredibility(url);
    }
  };

  const validateNewsUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const checkNewsCredibility = async (url: string) => {
    setIsCheckingCredibility(true);
    try {
      // Quick check for known unreliable sources
      const isKnownUnreliable = fakeNewsDetectorService.isKnownUnreliableSource(url);
      if (isKnownUnreliable) {
        setCredibilityInfo({
          score: 20,
          isReliable: false,
          reasons: ['This source is known for unreliable reporting']
        });
        return;
      }

      // For MVP, we'll do a basic check without fetching content
      // In production, you'd want to fetch and analyze the content
      const sourceCredibility = fakeNewsDetectorService.getSourceCredibility(url);
      
      setCredibilityInfo({
        score: sourceCredibility.rating,
        isReliable: sourceCredibility.rating >= 60,
        reasons: sourceCredibility.credibility === 'high' 
          ? ['Source is well-established and credible']
          : sourceCredibility.credibility === 'medium'
          ? ['Source has mixed credibility ratings']
          : ['Source has low credibility ratings']
      });
    } catch (error) {
      console.error('Error checking credibility:', error);
      setCredibilityInfo({
        score: 30,
        isReliable: false,
        reasons: ['Unable to verify source credibility']
      });
    } finally {
      setIsCheckingCredibility(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must connect your wallet to post stories. Please connect your wallet first.');
      return;
    }

    // Check rate limiting
    if (!rateLimitInfo.canPost) {
      setError(`Rate limit exceeded. Please wait ${rateLimiterService.getFormattedTimeRemaining(rateLimitInfo.timeRemaining)} before posting again.`);
      return;
    }
    
    // Validate content
    if (formData.content_type === 'media' && !formData.mediaFile) {
      setError('Please select a media file to upload.');
      return;
    }

    if (formData.content_type === 'news' && !formData.newsUrl) {
      setError('Please enter a news article URL.');
      return;
    }

    if (formData.content_type === 'news' && !validateNewsUrl(formData.newsUrl!)) {
      setError('Please enter a valid HTTPS URL.');
      return;
    }
    
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
        newsUrl: formData.newsUrl,
        contributor_id: formData.contributor_id,
        wallet: wallet,
        content_type: formData.content_type
      });

      if (post) {
        // Show earned points
        if (post.reward_points && post.reward_points > 0) {
          setEarnedPoints(post.reward_points);
        }
        
        // Show NFT minting result (if available)
        if (post.post_cid) {
          setNftMinted({
            tokenId: post.post_cid, // Using post_cid as token ID for now
            transactionHash: 'NFT minted successfully' // Placeholder
          });
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setEarnedPoints(null);
          setNftMinted(null);
          handleClose();
        }, 5000);
        
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
      } else if (errorMessage.includes('Rate limit')) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      text: '', 
      contributor_id: undefined, 
      content_type: 'media' 
    });
    setError(null);
    setIsSubmitting(false);
    setEarnedPoints(null);
    setNftMinted(null);
    setCredibilityInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getMediaTypeIcon = () => {
    if (!formData.mediaFile) return <Upload className="w-4 h-4" />;
    
    if (formData.mediaFile.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <Upload className="w-4 h-4" />;
  };

  const getFilePreview = () => {
    if (!formData.mediaFile) return null;

    if (formData.mediaFile.type.startsWith('video/')) {
      return (
        <div className="mt-2">
          <video 
            src={URL.createObjectURL(formData.mediaFile)} 
            controls 
            className="w-full h-32 object-cover rounded-lg border"
            preload="metadata"
          />
        </div>
      );
    }

    return null;
  };

  // Calculate potential points
  const potentialPoints = calculateRewardPoints({
    text: formData.text,
    media_type: formData.mediaFile ? 
      (formData.mediaFile.type.startsWith('video/') ? 'video' : undefined) : 
      (formData.content_type === 'news' ? 'news' : undefined),
    wallet_type: isAuthenticated ? wallet?.type : undefined
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Story</h2>
            <p className="text-gray-600 text-sm">
              Share your memories at this location
            </p>
          </div>

          {/* Authentication Warning */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Wallet Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You must connect your wallet to post stories and earn rewards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limit Warning */}
          {isAuthenticated && !rateLimitInfo.canPost && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Rate Limit Active</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Please wait {rateLimiterService.getFormattedTimeRemaining(rateLimitInfo.timeRemaining)} before posting again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Location: {lat.toFixed(6)}, {lng.toFixed(6)}
              </span>
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleContentTypeChange('media')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  formData.content_type === 'media'
                    ? 'bg-gold text-gray-900 border-gold'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                disabled={!isAuthenticated}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Media File</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleContentTypeChange('news')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  formData.content_type === 'news'
                    ? 'bg-gold text-gray-900 border-gold'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                disabled={!isAuthenticated}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Link className="w-4 h-4" />
                  <span>News URL</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Story Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Share your thoughts about this location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                rows={4}
                disabled={!isAuthenticated}
              />
            </div>

            {/* Media Upload */}
            {formData.content_type === 'media' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gold transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                    disabled={!isAuthenticated}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isAuthenticated}
                    className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gold transition-colors disabled:opacity-50"
                  >
                    {getMediaTypeIcon()}
                    <span>
                      {formData.mediaFile ? formData.mediaFile.name : 'Click to upload video (max 5MB)'}
                    </span>
                  </button>
                </div>
                {formData.mediaFile && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Selected: {formData.mediaFile.name} ({(formData.mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {getFilePreview()}
                  </div>
                )}
              </div>
            )}

            {/* News URL Input */}
            {formData.content_type === 'news' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News Article URL (HTTPS) *
                </label>
                <input
                  type="url"
                  value={formData.newsUrl || ''}
                  onChange={handleNewsUrlChange}
                  placeholder="https://example.com/news-article"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  disabled={!isAuthenticated}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a valid HTTPS URL to a news article. The content will be automatically summarized and verified.
                </p>
                
                {/* Credibility Check */}
                {isCheckingCredibility && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-blue-700">Checking article credibility...</span>
                    </div>
                  </div>
                )}
                
                {credibilityInfo && !isCheckingCredibility && (
                  <div className={`mt-2 p-3 border rounded-lg ${
                    credibilityInfo.isReliable 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {credibilityInfo.isReliable ? (
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            credibilityInfo.isReliable ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Credibility Score: {credibilityInfo.score}/100
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            credibilityInfo.isReliable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {credibilityInfo.isReliable ? 'RELIABLE' : 'UNRELIABLE'}
                          </span>
                        </div>
                        {credibilityInfo.reasons.length > 0 && (
                          <p className="text-xs mt-1 text-gray-600">
                            {credibilityInfo.reasons[0]}
                          </p>
                        )}
                        {!credibilityInfo.isReliable && (
                          <p className="text-xs mt-1 text-red-700">
                            ⚠️ This article may not be suitable for sharing. Consider finding a more credible source.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Potential Points */}
            {isAuthenticated && potentialPoints > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Potential reward: {potentialPoints} XP
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isAuthenticated || isSubmitting || !rateLimitInfo.canPost}
              className="w-full bg-gold hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Post Story</span>
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {earnedPoints && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Story Posted!</h3>
                  <p className="text-sm text-green-700">
                    You earned {earnedPoints} XP for your contribution!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NFT Minting Success Message */}
          {nftMinted && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-purple-800">NFT Minted!</h3>
                  <p className="text-sm text-purple-700">
                    Your story has been minted as an NFT on the blockchain.
                  </p>
                  {nftMinted.tokenId && (
                    <p className="text-xs text-purple-600 mt-1">
                      Token ID: {nftMinted.tokenId.slice(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 