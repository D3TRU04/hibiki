'use client';

import { KleoPost } from '@/lib/types';

interface StoryCardProps {
  post: KleoPost;
  onClick?: () => void;
}

export default function StoryCard({ post, onClick }: StoryCardProps) {
  return (
    <div onClick={onClick} className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{post.content}</h3>
          <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        {post.ai_summary && (
          <p className="text-sm text-gray-600 line-clamp-3">{post.ai_summary}</p>
        )}
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Open source
          </a>
        )}
      </div>
    </div>
  );
} 