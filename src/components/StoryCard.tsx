'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Play, Pause, Volume2 } from 'lucide-react';
import { Story } from '@/types';
import ContributorBadge from './ContributorBadge';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return '📰';
      case 'radio':
        return '📻';
      case 'user_story':
        return '👤';
      case 'audio_report':
        return '🎤';
      default:
        return '📝';
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(story.type)}</span>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {story.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTimeAgo(story.createdAt)}</span>
              <span>•</span>
              <span className={getTrustColor(story.trustScore)}>
                Trust: {story.trustScore}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Audio Controls */}
        {story.audioUrl && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause size={16} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Play size={16} className="text-blue-600 dark:text-blue-400" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        {showFullContent ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {story.content}
          </p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {story.summary || story.content.substring(0, 150)}
            {story.content.length > 150 && !story.summary && '...'}
          </p>
        )}
        
        {story.summary && story.content.length > 150 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs text-gray-600 dark:text-gray-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Contributor */}
      <div className="mb-3">
        <ContributorBadge contributor={story.contributor} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
            <ThumbsUp size={14} />
            <span className="text-xs">{story.upvotes}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
            <ThumbsDown size={14} />
            <span className="text-xs">{story.downvotes}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
            <MessageCircle size={14} />
            <span className="text-xs">Comment</span>
          </button>
        </div>
        
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
          <Share2 size={14} />
          <span className="text-xs">Share</span>
        </button>
      </div>
    </div>
  );
} 