import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Post } from '../../../types/backend';
import { PostController } from '../../../services/api';

// Set Mapbox access token
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
console.log('Mapbox token available:', !!mapboxToken);
mapboxgl.accessToken = mapboxToken!;

export function useMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add posts to map
  const addPostsToMap = useCallback((postsToAdd: Post[]) => {
    if (!map.current) return;

    // Add source for posts
    map.current.addSource('posts', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: postsToAdd.map(post => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [post.lng, post.lat],
          },
          properties: {
            id: post.id,
            text: post.text,
            media_url: post.media_url,
            created_at: post.created_at,
          },
        })),
      },
    });

    // Add layer for posts
    map.current.addLayer({
      id: 'posts',
      type: 'circle',
      source: 'posts',
      paint: {
        'circle-radius': 8,
        'circle-color': '#ef4444',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  }, []);

  // Load posts from Supabase
  const loadPosts = useCallback(async () => {
    try {
      console.log('Loading posts...');
      const fetchedPosts = await PostController.getPosts();
      console.log('Posts loaded:', fetchedPosts.length);
      setPosts(fetchedPosts);
      addPostsToMap(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addPostsToMap]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (!mapContainer.current) {
      console.log('Map container not ready');
      return;
    }

    console.log('Initializing map...');
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.006, 40.7128], // New York City
        zoom: 12,
      });

      console.log('Map created successfully');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Change cursor on hover
      map.current.on('mouseenter', 'posts', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'posts', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Load posts when map is ready
      map.current.on('load', () => {
        console.log('Map loaded, loading posts...');
        loadPosts();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Error creating map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [loadPosts]);

  // Add new post to map
  const addNewPostToMap = useCallback((newPost: Post) => {
    if (!map.current || !map.current.getSource('posts')) return;

    const source = map.current.getSource('posts') as mapboxgl.GeoJSONSource;
    const currentData = source.serialize();
    
    if (currentData.data && typeof currentData.data === 'object' && 'features' in currentData.data) {
      const newFeature = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [newPost.lng, newPost.lat],
        },
        properties: {
          id: newPost.id,
          text: newPost.text,
          media_url: newPost.media_url,
          created_at: newPost.created_at,
        },
      };

      const geoJsonData = currentData.data as { features: Array<{ type: string; geometry: { type: string; coordinates: number[] }; properties: Record<string, unknown> }> };
      geoJsonData.features.unshift(newFeature);
      source.setData(currentData.data);
    }
  }, []);

  return {
    mapContainer,
    map: map.current,
    posts,
    setPosts,
    isLoading,
    addNewPostToMap,
  };
} 