'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Post } from '@/lib/types';
import { getPosts } from '@/lib/api';

export function useMap() {
  const [map, setMapState] = useState<mapboxgl.Map | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setPosts]);

  const addPostsToMap = useCallback((mapInstance: mapboxgl.Map) => {
    postsRef.current.forEach((post) => {
      if (post.lat && post.lng) {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer';
        markerEl.style.transform = 'translate(-50%, -100%)';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3 max-w-xs">
            <p class="text-sm text-gray-600 mb-2">${new Date(post.created_at || '').toLocaleDateString()}</p>
            <p class="text-gray-900">${post.text}</p>
            ${post.media_url ? `<audio controls class="mt-3 w-full"><source src="${post.media_url}" type="audio/mpeg"></audio>` : ''}
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(markerEl)
          .setLngLat([post.lng, post.lat])
          .setPopup(popup)
          .addTo(mapInstance);
      }
    });
  }, []);

  const addNewPostToMap = useCallback((newPost: Post, mapInstance: mapboxgl.Map) => {
    if (newPost.lat && newPost.lng) {
      const markerEl = document.createElement('div');
      markerEl.className = 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer';
      markerEl.style.transform = 'translate(-50%, -100%)';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 max-w-xs">
          <p class="text-sm text-gray-600 mb-2">${new Date(newPost.created_at || '').toLocaleDateString()}</p>
          <p class="text-gray-900">${newPost.text}</p>
          ${newPost.media_url ? `<audio controls class="mt-3 w-full"><source src="${newPost.media_url}" type="audio/mpeg"></audio>` : ''}
        </div>
      `);

      new mapboxgl.Marker(markerEl)
        .setLngLat([newPost.lng, newPost.lat])
        .setPopup(popup)
        .addTo(mapInstance);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (map && posts.length > 0) {
      addPostsToMap(map);
    }
  }, [map, posts.length, addPostsToMap]);

  return {
    map,
    setMap,
    posts,
    setPosts,
    isLoading,
    addNewPostToMap,
    loadPosts,
  };
} 