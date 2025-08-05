'use client';

import { Plus, MapPin } from 'lucide-react';

interface MapControlsProps {
  postsCount: number;
  onAddStory: () => void;
}

export default function MapControls({ postsCount, onAddStory }: MapControlsProps) {
  return (
    <>
      {/* Add Story Button */}
      <div className="absolute top-20 left-4 z-20"> {/* Changed from top-4 to top-20 for navbar */}
        <button
          onClick={onAddStory}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Story</span>
        </button>
      </div>

      {/* Posts Count */}
      <div className="absolute top-20 right-4 z-20"> {/* Changed from top-4 to top-20 for navbar */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-red-500" />
            <span className="text-sm font-medium text-gray-700">
              {postsCount} stories
            </span>
          </div>
        </div>
      </div>
    </>
  );
} 