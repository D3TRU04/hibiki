'use client';

import dynamic from 'next/dynamic';
import { KleoPost } from '@/lib/types';

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
    <div className="w-96 h-full bg-gray-900/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden sidebar-transition">
      {showUserPanel && (
        <div className="p-4 border-b border-gray-700 relative">
          <button
            onClick={onCloseUserPanel}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close user panel"
          >
            ✕
          </button>
          <UserPanel />
        </div>
      )}

      {showStoryFeed && (
        <div className="flex-1 overflow-y-auto feed-container relative">
          <button
            onClick={onCloseFeed}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors z-10"
            aria-label="Close feed"
          >
            ✕
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