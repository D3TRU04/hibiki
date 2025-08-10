'use client';

import { useState, useEffect } from 'react';
import { Filter, Search, Video, Link, MessageSquare } from 'lucide-react';
import { KleoPost } from '@/lib/types';
import StoryCard from './StoryCard';
import { aiSummaryService } from '@/lib/ai/ai-summary';

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
  const [locationSummary, setLocationSummary] = useState<{ summary: string; videos: string[]; title: string } | null>(null);

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      {locationSummary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{locationSummary.title}</h3>
          <div className="flex gap-3">
            <div className="flex-1 text-sm text-gray-800 leading-relaxed max-h-40 overflow-auto">
              <div className="font-medium mb-1">AI Summary</div>
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