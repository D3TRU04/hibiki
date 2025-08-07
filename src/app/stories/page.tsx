'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/lib/types';
import { getPosts } from '@/lib/api';
import { Search, MapPin, Calendar, User, FileText, Mic, Video } from 'lucide-react';
import Link from 'next/link';

export default function StoriesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'audio' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'far_score' | 'engagement'>('date');

  useEffect(() => {
    loadPosts();
  }, []);

  const filterAndSortPosts = useCallback(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(post => post.type === selectedType);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'far_score':
          return (b.far_score || 0) - (a.far_score || 0);
        case 'engagement':
          return (b.engagement_score || 0) - (a.engagement_score || 0);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedType, sortBy]);

  useEffect(() => {
    filterAndSortPosts();
  }, [filterAndSortPosts]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white text-sm">Loading stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">K</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Stories</h1>
            </div>
            <Link 
              href="/Map" 
              className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-medium rounded-lg transition-all transform hover:scale-105"
            >
              Back to Map
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'text' | 'audio' | 'video')}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'far_score' | 'engagement')}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="date">Sort by Date</option>
              <option value="far_score">Sort by Reputation</option>
              <option value="engagement">Sort by Engagement</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-white text-sm">
                {filteredPosts.length} story{filteredPosts.length !== 1 ? 'ies' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 hover:scale-105">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {post.user?.email || 'Anonymous'}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {formatDate(post.created_at || '')}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(post.type)}`}>
                  {getTypeIcon(post.type)}
                  <span className="capitalize">{post.type}</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-white text-sm leading-relaxed line-clamp-3">
                  {post.content}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 mb-4 text-gray-300 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{post.lat.toFixed(4)}, {post.lng.toFixed(4)}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-gold">★</span>
                    <span>{post.far_score || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400">💬</span>
                    <span>{post.engagement_score || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(post.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>

              {/* Media Preview */}
              {post.media_url && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-gray-300">
                    {post.type === 'audio' && <Mic className="w-3 h-3" />}
                    {post.type === 'video' && <Video className="w-3 h-3" />}
                    <span>Media attached</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No stories found</h3>
            <p className="text-gray-300 mb-6">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a story!'
              }
            </p>
            <Link 
              href="/Map" 
              className="px-6 py-3 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-medium rounded-lg transition-all transform hover:scale-105"
            >
              Share Your Story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 