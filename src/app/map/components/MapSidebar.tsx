'use client';

import dynamic from 'next/dynamic';
import { KleoPost } from '@/lib/types';

const StoryFeed = dynamic(() => import('./StoryFeed'), { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading feed…</div> });
const UserPanel = dynamic(() => import('./UserPanel'), { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading profile…</div> });
const Leaderboard = dynamic(() => import('./Leaderboard'), { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading leaderboard…</div> });

interface MapSidebarProps {
  showStoryFeed: boolean;
  showUserPanel: boolean;
  selectedTag: string;
  selectedType: string;
  posts?: KleoPost[];
  onPostClick: (post: KleoPost) => void;
  onFilterChange: (filters: { tag?: string; type?: string }) => void;
}

export default function MapSidebar({
  showStoryFeed,
  showUserPanel,
  selectedTag,
  selectedType,
  posts = [],
  onPostClick,
  onFilterChange
}: MapSidebarProps) {
  if (!showStoryFeed && !showUserPanel) {
    return null;
  }

  return (
    <div className="w-1/3 h-full bg-white border-l border-gray-200 flex flex-col">
      {showUserPanel && (
        <div className="p-4 border-b border-gray-200">
          <UserPanel />
        </div>
      )}

      {showStoryFeed && (
        <div className="flex-1">
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