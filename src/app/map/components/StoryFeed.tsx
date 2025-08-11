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
  const [locationLabelByPostId, setLocationLabelByPostId] = useState<Record<string, string>>({});

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      if (!MAPBOX_TOKEN) return null;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,region,country&limit=5&access_token=${MAPBOX_TOKEN}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      const features: any[] = Array.isArray(data?.features) ? data.features : [];
      if (!features.length) return null;

      // Prefer place (city), then locality (town), then region, then country
      const preferred = ['place', 'locality', 'region', 'country'];
      const pick = preferred
        .map(t => features.find(f => (f?.place_type || f?.placeType || []).includes(t)))
        .find(Boolean) as any | undefined;

      const main = pick?.text || pick?.place_name || null;
      const ctx = Array.isArray(pick?.context) ? pick.context : Array.isArray(features[0]?.context) ? features[0].context : [];
      const region = ctx.find((c: any) => String(c?.id || '').startsWith('region.'))?.text;
      const country = ctx.find((c: any) => String(c?.id || '').startsWith('country.'))?.text;

      const parts = [main, region, country].filter(Boolean);
      if (!parts.length) return null;
      return parts.join(', ');
    } catch {
      return null;
    }
  };

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

    const [latStr, lngStr] = chosenKey.split(',');
    const latNum = Number(latStr);
    const lngNum = Number(lngStr);

    const newsText = chosen.filter(p => p.type !== 'video').map(p => p.ai_summary || p.content).filter(Boolean).join('\n\n');
    const videos = chosen.filter(p => p.type === 'video' || p.content_type === 'media' || !!p.media_url)
      .map(p => (p.media_url?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${p.media_url.replace('ipfs://','')}` : p.media_url || p.ipfs_post_url))
      .filter(Boolean) as string[];

    (async () => {
      try {
        const [ai, placeName] = await Promise.all([
          aiSummaryService.generateSummary({ mediaType: 'news', content: newsText || 'No news content provided.' }),
          reverseGeocode(latNum, lngNum)
        ]);
        const title = placeName ? placeName : `Location ${chosenKey}`;
        setLocationSummary({ summary: ai.summary, videos: videos.slice(0, 3), title });
      } catch {
        const title = `Location ${chosenKey}`;
        setLocationSummary({ summary: 'Summary unavailable.', videos: videos.slice(0, 3), title });
      }
    })();
  }, [filteredPosts]);

  // Compute location labels for visible posts (top 24)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const visible = filteredPosts.slice(0, 24);
      const updates: Record<string, string> = {};
      for (const p of visible) {
        const key = `${Number(p.lat).toFixed(4)},${Number(p.lng).toFixed(4)}`;
        if (locationLabelByPostId[p.id]) continue;
        const name = await reverseGeocode(Number(p.lat), Number(p.lng));
        if (cancelled) return;
        if (name) updates[p.id] = name;
      }
      if (Object.keys(updates).length) {
        setLocationLabelByPostId(prev => ({ ...prev, ...updates }));
      }
    })();
    return () => { cancelled = true; };
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
          <h3 className="text-lg font-normal text-white mb-2">{locationSummary.title}</h3>
          <div className="flex gap-3">
            <div className="flex-1 text-sm text-gray-300 leading-relaxed max-h-40 overflow-auto">
              <div className="mb-1 text-gold">AI Summary</div>
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
      <div className="sticky top-0 z-10 -mx-6 px-6 pb-4 mb-4 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-normal text-white tracking-tight">Global Feed</h2>
            <p className="text-gray-300 text-sm">
              {filteredPosts.length} of {posts.length} stories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-full transition text-white ring-1 ring-inset ring-white/10"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
                onFilterChange?.({ tag: undefined, type: undefined });
              }}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm rounded-full transition shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stories..."
                value={selectedTag ?? searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); onFilterChange?.({ tag: e.target.value || undefined }); }}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-gold focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'video', 'news', 'text'] as FilterType[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => handleSetFilter(filter)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
                    (selectedType || activeFilter) === filter
                      ? 'bg-gold text-gray-900 shadow'
                      : 'bg-white/10 text-gray-200 hover:bg-white/15 ring-1 ring-inset ring-white/10'
                  }`}
                >
                  {getFilterIcon(filter)}
                  <span>{getFilterLabel(filter)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredPosts.map(post => (
            <StoryCard
              key={post.id}
              post={post}
              onClick={onPostClick ? () => onPostClick(post) : undefined}
              locationLabel={locationLabelByPostId[post.id]}
            />
          ))}
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-inset ring-white/10">
            <div className="w-8 h-8 border-4 border-white/20 border-t-gold rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-normal text-white mb-2">Loading stories...</h3>
          <p className="text-gray-300">Please wait while we fetch the latest stories</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-inset ring-white/10">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-normal text-white mb-2">No stories found</h3>
          <p className="text-gray-300">
            {(selectedTag ?? searchTerm) || (selectedType ?? activeFilter) !== 'all' 
              ? 'Try adjusting your search or filters'
              : posts.length === 0 
                ? 'No stories have been shared yet. Be the first to share a story!'
                : 'No stories match your current filters'}
          </p>
          {posts.length === 0 && (
            <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
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
            <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
              <p className="text-sm text-yellow-200 mb-3">
                <strong>Tip:</strong> Try clearing your filters or adjusting your search terms
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                  onFilterChange?.({ tag: undefined, type: undefined });
                }}
                className="px-4 py-2 bg-yellow-800/80 hover:bg-yellow-700 text-yellow-100 text-sm rounded-full transition"
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