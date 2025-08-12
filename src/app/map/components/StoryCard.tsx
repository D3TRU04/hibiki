'use client';

import { KleoPost } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface StoryCardProps {
  post: KleoPost;
  onClick?: () => void;
  locationLabel?: string;
}

export default function StoryCard({ post, onClick, locationLabel }: StoryCardProps) {
  const content = post.content || 'No content available';
  const summary = post.ai_summary || '';
  const createdAt = post.created_at ? new Date(post.created_at) : new Date();
  const typeLabel = post.type === 'video' ? 'Video' : post.type === 'news' ? 'News' : 'Text';
  const sourceUrl = post.source_url;
  let sourceHost: string | null = null;
  try { sourceHost = sourceUrl ? new URL(sourceUrl).hostname.replace(/^www\./, '') : null; } catch { sourceHost = null; }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group rounded-xl overflow-hidden bg-white/[0.04] backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] ring-1 ring-inset ring-white/10 hover:ring-white/20 transition shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-white/10 text-gray-200 ring-1 ring-inset ring-white/10">
            {typeLabel}
          </span>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {createdAt.toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-base font-normal text-white/95 leading-snug line-clamp-2 mb-1">
          {content.length > 140 ? `${content.substring(0, 140)}...` : content}
        </h3>
        {post.content_type === 'news' && sourceUrl && (
          <div className="mt-1 mb-2 text-xs">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 hover:text-blue-200 underline underline-offset-2 break-all line-clamp-1"
              onClick={(e) => e.stopPropagation()}
              title={sourceUrl}
            >
              {sourceHost ? `${sourceHost} • ` : ''}{sourceUrl}
            </a>
          </div>
        )}
        {locationLabel && (
          <div className="mt-1 mb-2 inline-flex items-center gap-1 text-[11px] text-gray-300">
            <MapPin className="w-3 h-3 text-gold" />
            <span className="truncate max-w-[85%]">{locationLabel}</span>
          </div>
        )}
        {summary && (
          <p className="text-sm text-gray-300/95 line-clamp-3">
            {summary}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          {post.source_url ? (
            <a
              href={post.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gold hover:text-yellow-300 underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Open source
            </a>
          ) : <span />}
          {post.media_url && (
            <span className="text-[11px] text-gray-400">Has media</span>
          )}
        </div>
      </div>
    </div>
  );
} 