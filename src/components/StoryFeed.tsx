'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Tag, Image, Video, Music, Filter } from 'lucide-react';
import { KleoPost } from '@/lib/types';
import { getPosts } from '@/lib/api';

interface StoryFeedProps {
  onPostClick: (post: KleoPost) => void;
  selectedTag?: string;
  selectedType?: string;
  onFilterChange: (filters: { tag?: string; type?: string }) => void;
}

interface FilterState {
  tag?: string;
  type?: string;
}

export default function StoryFeed({
  onPostClick,
  selectedTag,
  selectedType,
  onFilterChange
}: StoryFeedProps) {
  const [posts, setPosts] = useState<KleoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    tag: selectedTag,
    type: selectedType
  });

  // Load posts
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedPosts = await getPosts(filters);
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Failed to load stories. Please try again.');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { tag: undefined, type: undefined };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getMediaTypeIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getMediaTypeLabel = (mediaType?: string): string => {
    switch (mediaType) {
      case 'image':
        return 'Photo';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Text';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Stories</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>

            {/* Media Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Media Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'text', 'image', 'video', 'audio'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange({ ...filters, type: type === 'all' ? undefined : type })}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filters.type === type || (!filters.type && type === 'all')
                        ? 'bg-gold text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['conflict', 'dailyLife', 'music', 'food', 'travel', 'art'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleFilterChange({ ...filters, tag: filters.tag === tag ? undefined : tag })}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filters.tag === tag
                        ? 'bg-gold text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500">Loading stories...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadPosts}
              className="mt-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 text-sm">No stories found</p>
            {filters.tag || filters.type ? (
              <button
                onClick={clearFilters}
                className="mt-2 text-gold hover:text-yellow-500 text-sm"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => onPostClick(post)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Media Type Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getMediaTypeIcon(post.media_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {getMediaTypeLabel(post.media_type)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-900 mb-2">
                      {truncateText(post.text)}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 