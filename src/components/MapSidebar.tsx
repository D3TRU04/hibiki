'use client';

import StoryFeed from '@/components/StoryFeed';
import UserPanel from '@/components/UserPanel';
import Leaderboard from '@/components/Leaderboard';
import { KleoPost } from '@/lib/types';

interface MapSidebarProps {
  showStoryFeed: boolean;
  showUserPanel: boolean;
  selectedTag: string;
  selectedType: string;
  onPostClick: (post: KleoPost) => void;
  onFilterChange: (filters: { tag?: string; type?: string }) => void;
}

export default function MapSidebar({
  showStoryFeed,
  showUserPanel,
  selectedTag,
  selectedType,
  onPostClick,
  onFilterChange
}: MapSidebarProps) {
  if (!showStoryFeed && !showUserPanel) {
    return null;
  }

  return (
    <div className="w-1/3 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* User Panel */}
      {showUserPanel && (
        <div className="p-4 border-b border-gray-200">
          <UserPanel />
        </div>
      )}

      {/* Story Feed */}
      {showStoryFeed && (
        <div className="flex-1">
          <StoryFeed
            onPostClick={onPostClick}
            selectedTag={selectedTag}
            selectedType={selectedType}
            onFilterChange={onFilterChange}
          />
        </div>
      )}

      {/* Leaderboard (if both panels are shown) */}
      {showUserPanel && showStoryFeed && (
        <div className="p-4 border-t border-gray-200">
          <Leaderboard />
        </div>
      )}
    </div>
  );
} 