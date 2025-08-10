'use client';

import { useState, useCallback, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import { Post } from '@/lib/types';
import { getPosts } from '@/lib/api';

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
    // Instant cache hydrate (subsequent visits)
    try {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem('kleo_posts_cache');
        if (raw) {
          const cached = JSON.parse(raw) as { posts: Post[]; ts: number };
          if (Array.isArray(cached.posts)) {
            setPosts(cached.posts);
          }
        }
      }
    } catch {}

    setIsLoading(true);
    try {
      const kleoPosts = await getPosts();
      const convertedPosts: Post[] = kleoPosts.map(kleoPost => ({
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
      }));
      setPosts(convertedPosts);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kleo_posts_cache', JSON.stringify({ posts: convertedPosts, ts: Date.now() }));
        }
      } catch {}
    } catch (error) {
      console.error('Error loading posts:', error);
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