'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Tag, Star, ExternalLink, FileText, Image, Video, Music, Link as LinkIcon, MessageSquare, User, Brain, Shield } from 'lucide-react';
import { KleoPost } from '@/lib/types';

interface StoryCardProps {
  post: KleoPost;
  onClick?: () => void;
}

export default function StoryCard({ post }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMediaTypeIcon = () => {
    switch (post.type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'news':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMediaTypeLabel = () => {
    switch (post.type) {
      case 'video':
        return 'Video';
      case 'news':
        return 'News Article';
      default:
        return 'Text';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <Link
              href={`/profile/${post.user_id}`}
              className="text-sm font-medium text-gray-900 hover:text-gold transition-colors"
            >
              {post.contributor_id || 'Anonymous'}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {getMediaTypeIcon()}
            <span>{getMediaTypeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 mb-3">{post.content}</p>
        
        {/* AI Summary */}
        {post.ai_summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 mb-1">AI Summary</h4>
                <p className="text-sm text-blue-700">{post.ai_summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* News Source Link */}
        {post.source_url && (
          <div className="mb-3">
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Source Article</span>
            </a>
          </div>
        )}

        {/* Credibility Info */}
        {post.credibility_score !== undefined && (
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
            post.is_reliable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <Shield className="w-3 h-3" />
            <span>
              Credibility: {post.credibility_score}/100
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{post.lat.toFixed(4)}, {post.lng.toFixed(4)}</span>
          </div>
          {post.far_score > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{post.far_score} XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 