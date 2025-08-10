'use client';

import { useState, useCallback, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import { Post } from '@/lib/types';
import { getPosts } from '@/lib/api/api';

export function useMap() {
  const [map, setMapState] = useState<mapboxgl.Map | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const postsRef = useRef<Post[]>([]);

  const setMap = useCallback((mapInstance: mapboxgl.Map | null) => {
    setMapState(mapInstance);
  }, []);

  const setPosts = useCallback((updater: Post[] | ((prev: Post[]) => Post[])) => {
    if (typeof updater === 'function') {
      setPostsState(prev => {
        const newPosts = updater(prev);
        postsRef.current = newPosts;
        return newPosts;
      });
    } else {
      setPostsState(updater);
      postsRef.current = updater;
    }
  }, []);

  const loadPosts = useCallback(async () => {
    console.log('🔄 Starting to load posts...');
    
    // Instant cache hydrate (subsequent visits)
    try {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem('kleo_posts_cache');
        if (raw) {
          const cached = JSON.parse(raw) as { posts: Post[]; ts: number };
          if (Array.isArray(cached.posts)) {
            console.log(`📋 Using cached posts: ${cached.posts.length} posts`);
            setPosts(cached.posts);
          }
        }
      }
    } catch {}

    setIsLoading(true);
    try {
      console.log('📡 Fetching posts from API...');
      const kleoPosts = await getPosts();
      console.log(`📊 API returned ${kleoPosts.length} KleoPosts`);
      
      const convertedPosts: Post[] = kleoPosts.map(kleoPost => {
        const post: Post = {
          id: kleoPost.id,
          user_id: kleoPost.user_id || 'anonymous',
          type: kleoPost.type === 'video' ? 'video' : 'text',
          content: kleoPost.content,
          lat: kleoPost.lat,
          lng: kleoPost.lng,
          media_url: kleoPost.media_url || kleoPost.ipfs_metadata_url,
          ipfs_post_url: kleoPost.ipfs_metadata_url,
          far_score: kleoPost.far_score || 0,
          engagement_score: kleoPost.engagement_score || 0,
          flags: kleoPost.flags || 0,
          created_at: kleoPost.created_at,
          updated_at: kleoPost.created_at,
          tags: [],
        };
        
        console.log(`📍 Converting post ${post.id}: lat=${post.lat}, lng=${post.lng}`);
        return post;
      });
      
      console.log(`✅ Converted ${convertedPosts.length} posts to Post format`);
      console.log(`📍 Posts with valid coordinates:`, convertedPosts.filter(p => p.lat != null && p.lng != null).length);
      
      setPosts(convertedPosts);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kleo_posts_cache', JSON.stringify({ posts: convertedPosts, ts: Date.now() }));
        }
      } catch {}
    } catch (error) {
      console.error('❌ Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setPosts]);

  return {
    map,
    setMap,
    posts,
    setPosts,
    isLoading,
    loadPosts,
  };
} 