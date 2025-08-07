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
        // Create marker element with Kleo theme
        const markerEl = document.createElement('div');
        markerEl.className = 'w-6 h-6 bg-gradient-to-br from-gold to-yellow-400 rounded-full border-2 border-white shadow-lg cursor-pointer';
        markerEl.style.transform = 'translate(-50%, -100%)';

        // Create popup with enhanced content
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-4 max-w-xs">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center">
                <span class="text-gray-900 font-bold text-xs">K</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">${post.user?.email || 'Anonymous'}</p>
                <p class="text-xs text-gray-500">${new Date(post.created_at || '').toLocaleDateString()}</p>
              </div>
            </div>
            <p class="text-gray-900 mb-3">${post.content}</p>
            ${post.media_url ? `
              <div class="mt-3">
                ${post.type === 'audio' ? 
                  `<audio controls class="w-full"><source src="${post.media_url}" type="audio/mpeg"></audio>` :
                  post.type === 'video' ?
                  `<video controls class="w-full"><source src="${post.media_url}" type="video/mp4"></video>` :
                  ''
                }
              </div>
            ` : ''}
            <div class="mt-2 text-xs text-gray-500">
              <span class="bg-gray-100 px-2 py-1 rounded">${post.type}</span>
            </div>
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
      markerEl.className = 'w-6 h-6 bg-gradient-to-br from-gold to-yellow-400 rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse';
      markerEl.style.transform = 'translate(-50%, -100%)';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-4 max-w-xs">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-6 h-6 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center">
              <span class="text-gray-900 font-bold text-xs">K</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">${newPost.user?.email || 'Anonymous'}</p>
              <p class="text-xs text-gray-500">${new Date(newPost.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
          <p class="text-gray-900 mb-3">${newPost.content}</p>
          ${newPost.media_url ? `
            <div class="mt-3">
              ${newPost.type === 'audio' ? 
                `<audio controls class="w-full"><source src="${newPost.media_url}" type="audio/mpeg"></audio>` :
                newPost.type === 'video' ?
                `<video controls class="w-full"><source src="${newPost.media_url}" type="video/mp4"></video>` :
                ''
              }
            </div>
          ` : ''}
          <div class="mt-2 text-xs text-gray-500">
            <span class="bg-gray-100 px-2 py-1 rounded">${newPost.type}</span>
          </div>
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