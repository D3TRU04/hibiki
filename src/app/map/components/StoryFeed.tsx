'use client';

import { useState, useEffect } from 'react';
import { Filter, Search, Video, Link, MessageSquare } from 'lucide-react';
import { KleoPost } from '@/lib/types';
import StoryCard from './StoryCard';
import { aiSummaryService } from '@/lib/ai/ai-summary';

interface StoryFeedProps {
  posts: KleoPost[];
  onPostClick?: (_post: KleoPost) => void;
  selectedTag?: string;
  selectedType?: string;
  onFilterChange?: (_filters: { tag?: string; type?: string }) => void;
}

type FilterType = 'all' | 'video' | 'news' | 'text';

export default function StoryFeed({ posts, onPostClick, selectedTag, selectedType, onFilterChange }: StoryFeedProps) {
  const [filteredPosts, setFilteredPosts] = useState<KleoPost[]>(posts);
  const [activeFilter, setActiveFilter] = useState<FilterType>(selectedType as FilterType || 'all');
  const [searchTerm, setSearchTerm] = useState(selectedTag || '');
  const [showFilters, setShowFilters] = useState(false);
  const [locationSummary, setLocationSummary] = useState<{ summary: string; videos: string[]; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update filtered posts when posts change
  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  // Simulate loading state for better UX
  useEffect(() => {
    if (posts.length === 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [posts.length]);

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

  useEffect(() => {
    // Aggregate the most recent location group from filteredPosts
    if (!filteredPosts.length) { setLocationSummary(null); return; }
    const top = filteredPosts.slice(0, 50); // consider a window for performance
    // Group by rounded lat/lng
    const groupMap = new Map<string, KleoPost[]>();
    for (const p of top) {
      const key = `${Number(p.lat).toFixed(4)},${Number(p.lng).toFixed(4)}`;
      const arr = groupMap.get(key) || [];
      arr.push(p);
      groupMap.set(key, arr);
    }
    // Pick the largest group
    let chosenKey: string | null = null;
    let chosen: KleoPost[] = [];
    for (const [k, arr] of groupMap.entries()) {
      if (arr.length > chosen.length) { chosen = arr; chosenKey = k; }
    }
    if (!chosenKey || !chosen.length) { setLocationSummary(null); return; }
    const title = `Location ${chosenKey}`;
    const newsText = chosen.filter(p => p.type !== 'video').map(p => p.ai_summary || p.content).filter(Boolean).join('\n\n');
    const videos = chosen.filter(p => p.type === 'video' || p.content_type === 'media' || !!p.media_url)
      .map(p => (p.media_url?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${p.media_url.replace('ipfs://','')}` : p.media_url || p.ipfs_post_url))
      .filter(Boolean) as string[];
    (async () => {
      try {
        const ai = await aiSummaryService.generateSummary({ mediaType: 'news', content: newsText || 'No news content provided.' });
        setLocationSummary({ summary: ai.summary, videos: videos.slice(0, 3), title });
      } catch {
        setLocationSummary({ summary: 'Summary unavailable.', videos: videos.slice(0, 3), title });
      }
    })();
  }, [filteredPosts]);

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
    <div className="bg-transparent rounded-lg p-6">
      {locationSummary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">{locationSummary.title}</h3>
          <div className="flex gap-3">
            <div className="flex-1 text-sm text-gray-300 leading-relaxed max-h-40 overflow-auto">
              <div className="font-medium mb-1 text-gold">AI Summary</div>
              <div>{locationSummary.summary}</div>
            </div>
            <div className="w-40 space-y-2">
              {locationSummary.videos.length
                ? locationSummary.videos.map((v, i) => (
                    <video key={i} src={v} controls className="w-full h-20 object-cover rounded" preload="metadata" />
                  ))
                : <div className="text-xs text-gray-500">No media</div>}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Global Feed</h2>
          <p className="text-gray-300 text-sm">
            {filteredPosts.length} of {posts.length} stories
          </p>
          {posts.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              No posts available yet
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
              onFilterChange?.({ tag: undefined, type: undefined });
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
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
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-gold rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Loading stories...</h3>
          <p className="text-gray-300">Please wait while we fetch the latest stories</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No stories found</h3>
          <p className="text-gray-300">
            {(selectedTag ?? searchTerm) || (selectedType ?? activeFilter) !== 'all' 
              ? 'Try adjusting your search or filters'
              : posts.length === 0 
                ? 'No stories have been shared yet. Be the first to share a story!'
                : 'No stories match your current filters'}
          </p>
          {posts.length === 0 && (
            <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <p className="text-sm text-blue-200 mb-2">
                <strong>Getting started:</strong>
              </p>
              <ul className="text-xs text-blue-100 space-y-1 text-left max-w-sm mx-auto">
                <li>• Click &quot;Share Story&quot; to add your first story</li>
                <li>• Connect your wallet to start sharing</li>
                <li>• Stories will appear here once shared</li>
              </ul>
            </div>
          )}
          {posts.length > 0 && filteredPosts.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700">
              <p className="text-sm text-yellow-200 mb-3">
                <strong>Tip:</strong> Try clearing your filters or adjusting your search terms
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                  onFilterChange?.({ tag: undefined, type: undefined });
                }}
                className="px-4 py-2 bg-yellow-800 hover:bg-yellow-700 text-yellow-100 text-sm rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 