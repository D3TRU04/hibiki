'use client';

import { useState } from 'react';
import { Post } from '../../../types/backend';
import AudioPlayer from './AudioPlayer';

interface PinMarkerProps {
  post: Post;
  onClick: () => void;
  isActive: boolean;
}

export default function PinMarker({ post, onClick, isActive }: PinMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
        isActive ? 'z-20' : 'z-10'
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      {/* Pin */}
      <div
        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
          isActive
            ? 'bg-blue-600 scale-110'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-30">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  {post.created_at && formatDate(post.created_at)}
                </p>
                <p className="text-gray-900 leading-relaxed">
                  {post.text}
                </p>
              </div>
            </div>

            {/* Audio Player */}
            {post.media_url && (
              <AudioPlayer audioUrl={post.media_url} />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 