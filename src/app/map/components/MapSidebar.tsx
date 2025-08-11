'use client';

import dynamic from 'next/dynamic';
import { KleoPost } from '@/lib/types';
import { X } from 'lucide-react';

const StoryFeed = dynamic(() => import('./StoryFeed'), { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading feed…</div> });
const UserPanel = dynamic(() => import('./UserPanel'), { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading profile…</div> });

interface MapSidebarProps {
  showStoryFeed: boolean;
  showUserPanel: boolean;
  selectedTag: string;
  selectedType: string;
  posts?: KleoPost[];
  onPostClick: (_post: KleoPost) => void;
  onFilterChange: (_filters: { tag?: string; type?: string }) => void;
  onCloseFeed?: () => void;
  onCloseUserPanel?: () => void;
}

export default function MapSidebar({
  showStoryFeed,
  showUserPanel,
  selectedTag,
  selectedType,
  posts = [],
  onPostClick,
  onFilterChange,
  onCloseFeed,
  onCloseUserPanel
}: MapSidebarProps) {
  if (!showStoryFeed && !showUserPanel) {
    return null;
  }

  return (
    <div className="w-96 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/60 via-gray-900/80 to-black/90 backdrop-blur-xl border-l border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden sidebar-transition">
      {showUserPanel && (
        <div className="p-4 border-b border-white/10 relative">
          <button
            onClick={onCloseUserPanel}
            className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-300 hover:text-white hover:bg-white/10 ring-1 ring-inset ring-white/10 transition"
            aria-label="Close user panel"
          >
            <X className="w-4 h-4" />
          </button>
          <UserPanel />
        </div>
      )}

      {showStoryFeed && (
        <div className="flex-1 overflow-y-auto feed-container relative">
          <button
            onClick={onCloseFeed}
            className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-300 hover:text-white hover:bg-white/10 ring-1 ring-inset ring-white/10 transition z-10"
            aria-label="Close feed"
          >
            <X className="w-4 h-4" />
          </button>
          <StoryFeed
            posts={posts}
            onPostClick={onPostClick}
            selectedTag={selectedTag}
            selectedType={selectedType}
            onFilterChange={onFilterChange}
          />
        </div>
      )}

      {/* Leaderboard moved to a different location */}
    </div>
  );
} 