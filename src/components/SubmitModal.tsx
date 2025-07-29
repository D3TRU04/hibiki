'use client';

import { useState } from 'react';
import { X, Upload, Mic, Radio, Link, Globe, Tag } from 'lucide-react';
import { Region } from '@/types';

interface SubmitModalProps {
  onClose: () => void;
}

// Mock regions for the form
const availableRegions: Region[] = [
  { id: 'new-york', name: 'New York', country: 'United States', countryCode: 'US', coordinates: [-74.006, 40.7128] },
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', coordinates: [-0.1276, 51.5074] },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', coordinates: [139.6917, 35.6895] },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', coordinates: [72.8777, 19.076] },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', coordinates: [3.3792, 6.5244] }
];

export default function SubmitModal({ onClose }: SubmitModalProps) {
  const [formData, setFormData] = useState({
    type: 'user_story' as 'user_story' | 'audio_report' | 'radio_link',
    region: '',
    title: '',
    content: '',
    audioFile: null as File | null,
    radioUrl: '',
    tags: '',
    language: 'en'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would:
    // 1. Upload audio file to IPFS if present
    // 2. Submit story to Supabase
    // 3. Mint StoryNode NFT if eligible
    // 4. Distribute RLUSD rewards
    // Note: AI summarization is disabled for now

    console.log('Submitting story:', formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setFormData(prev => ({ ...prev, audioFile: file }));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_story':
        return '👤';
      case 'audio_report':
        return '🎤';
      case 'radio_link':
        return '📻';
      default:
        return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Submit New Story
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Story Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Story Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'user_story', label: 'User Story', icon: '👤', desc: 'Text story from the ground' },
                { value: 'audio_report', label: 'Audio Report', icon: '🎤', desc: 'Voice recording' },
                { value: 'radio_link', label: 'Radio Link', icon: '📻', desc: 'Live radio stream' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe size={16} className="inline mr-2" />
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a region</option>
              {availableRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}, {region.country}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter a descriptive title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Share your story, news, or observation..."
            />
          </div>

          {/* Audio Upload */}
          {formData.type === 'audio_report' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mic size={16} className="inline mr-2" />
                Audio File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.audioFile ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ {formData.audioFile.name}
                      </span>
                    ) : (
                      'Click to upload audio file (MP3, WAV, M4A)'
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Radio URL */}
          {formData.type === 'radio_link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Radio size={16} className="inline mr-2" />
                Radio Stream URL
              </label>
              <input
                type="url"
                value={formData.radioUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, radioUrl: e.target.value }))}
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://stream.example.com/radio-station"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="inline mr-2" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="news, local, weather, business..."
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          {/* Rewards Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💰 Potential Rewards
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div>• Earn 2-5 RLUSD for verified stories</div>
              <div>• Unlock StoryNode NFT after 10 trusted submissions</div>
              <div>• Higher rewards for audio reports and breaking news</div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 