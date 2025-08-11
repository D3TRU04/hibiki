'use client';

import { KleoPost } from '@/lib/types';

interface StoryCardProps {
  post: KleoPost;
  onClick?: () => void;
}

export default function StoryCard({ post, onClick }: StoryCardProps) {
  // Handle edge cases for post data
  const content = post.content || 'No content available';
  const summary = post.ai_summary || '';
  const createdAt = post.created_at ? new Date(post.created_at) : new Date();
  
  return (
    <div onClick={onClick} className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 story-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
            {content.length > 100 ? `${content.substring(0, 100)}...` : content}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {createdAt.toLocaleDateString()}
          </span>
        </div>
        {summary && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">{summary}</p>
        )}
        {post.source_url && (
          <a 
            href={post.source_url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            Open source
          </a>
        )}
        {post.media_url && (
          <div className="mt-2 text-xs text-gray-500">
            📎 Has media
          </div>
        )}
      </div>
    </div>
  );
} 