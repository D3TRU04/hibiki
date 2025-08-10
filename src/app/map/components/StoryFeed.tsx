'use client';

import { useState, useEffect } from 'react';
import { Filter, Search, Video, Link, MessageSquare } from 'lucide-react';
import { KleoPost } from '@/lib/types';
import StoryCard from './StoryCard';

interface StoryFeedProps {
  posts: KleoPost[];
  onPostClick?: (post: KleoPost) => void;
  selectedTag?: string;
  selectedType?: string;
  onFilterChange?: (filters: { tag?: string; type?: string }) => void;
}

type FilterType = 'all' | 'video' | 'news' | 'text';

export default function StoryFeed({ posts, onPostClick, selectedTag, selectedType, onFilterChange }: StoryFeedProps) {
  const [filteredPosts, setFilteredPosts] = useState<KleoPost[]>(posts);
  const [activeFilter, setActiveFilter] = useState<FilterType>(selectedType as FilterType || 'all');
  const [searchTerm, setSearchTerm] = useState(selectedTag || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = posts;

    const effectiveType = selectedType ? (selectedType as FilterType) : activeFilter;
    if (effectiveType !== 'all') {
      filtered = filtered.filter(post => post.type === effectiveType);
    }

    const term = selectedTag ?? searchTerm;
    if (term.trim()) {
      const lower = term.toLowerCase();
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(lower) ||
        (post.ai_summary && post.ai_summary.toLowerCase().includes(lower)) ||
        (post.user_id && post.user_id.toLowerCase().includes(lower))
      );
    }

    setFilteredPosts(filtered);
  }, [posts, activeFilter, searchTerm, selectedTag, selectedType]);

  const handleSetFilter = (filter: FilterType) => {
    setActiveFilter(filter);
    onFilterChange?.({ type: filter === 'all' ? undefined : filter });
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'news':
        return <Link className="w-4 h-4" />;
      case 'text':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'video':
        return 'Videos';
      case 'news':
        return 'News';
      case 'text':
        return 'Text';
      default:
        return 'All';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Feed</h2>
          <p className="text-gray-600 text-sm">
            {filteredPosts.length} of {posts.length} stories
          </p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stories..."
              value={selectedTag ?? searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); onFilterChange?.({ tag: e.target.value || undefined }); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'video', 'news', 'text'] as FilterType[]).map(filter => (
              <button
                key={filter}
                onClick={() => handleSetFilter(filter)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (selectedType || activeFilter) === filter
                    ? 'bg-gold text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getFilterIcon(filter)}
                <span>{getFilterLabel(filter)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => (
            <StoryCard key={post.id} post={post} onClick={onPostClick ? () => onPostClick(post) : undefined} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">
            {(selectedTag ?? searchTerm) || (selectedType ?? activeFilter) !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to share a story at this location!'}
          </p>
        </div>
      )}
    </div>
  );
} 