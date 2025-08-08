'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play, ExternalLink, FileText, Image, Video, Music, Link } from 'lucide-react';

interface MapContainerProps {
  posts: KleoPost[];
  onMapClick: (lat: number, lng: number) => void;
  onPostClick?: (post: KleoPost) => void;
}

export default function MapContainer({ onMapClick, onMapReady, posts = [] }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [0, 0],
      zoom: 2,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      if (map.current) {
        onMapReady(map.current);
      }
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      onMapClick(lat, lng);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapClick, onMapReady]);

  // Update markers when posts change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    posts.forEach(post => {
      const marker = createEnhancedMarker(post);
      if (marker) {
        markers.current.push(marker);
      }
    });
  }, [posts]);

  const createEnhancedMarker = (post: any) => {
    if (!map.current) return null;

    // Create marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-marker';
    markerEl.innerHTML = `
      <div class="marker-content">
        <div class="marker-icon ${getMarkerIconClass(post.media_type)}">
          ${getMarkerIcon(post.media_type)}
        </div>
        ${post.reward_points ? `<div class="marker-xp">${post.reward_points}XP</div>` : ''}
      </div>
    `;

    // Create popup
    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '400px',
      className: 'custom-popup'
    });

    // Set popup content
    popup.setHTML(createPopupContent(post));

    // Create marker
    const marker = new mapboxgl.Marker(markerEl)
      .setLngLat([post.lng, post.lat])
      .setPopup(popup)
      .addTo(map.current);

    // Add hover effects
    markerEl.addEventListener('mouseenter', () => {
      markerEl.classList.add('marker-hover');
      popup.addTo(map.current!);
    });

    markerEl.addEventListener('mouseleave', () => {
      markerEl.classList.remove('marker-hover');
      // Don't close popup on mouseleave to allow interaction
    });

    return marker;
  };

  const getMarkerIconClass = (mediaType?: string) => {
    switch (mediaType) {
      case 'video':
        return 'marker-video';
      case 'news':
        return 'marker-news';
      default:
        return 'marker-text';
    }
  };

  const getMarkerIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'video':
        return '🎥';
      case 'news':
        return '📰';
      default:
        return '📝';
    }
  };

  const createPopupContent = (post: KleoPost) => {
    const mediaType = post.type;
    const hasMedia = post.media_url;
    const hasSource = post.source_url;
    
    return `
      <div class="popup-content">
        <div class="popup-header">
          <div class="popup-user">
            <div class="popup-avatar">${post.contributor_id?.slice(0, 2).toUpperCase() || 'AN'}</div>
            <div class="popup-user-info">
              <a href="/profile/${post.user_id}" class="popup-username-link">
                <div class="popup-username">${post.contributor_id || 'Anonymous'}</div>
              </a>
              <div class="popup-date">${formatDate(post.created_at)}</div>
            </div>
          </div>
          <div class="popup-type">
            <span class="popup-type-badge ${mediaType}">${getMediaTypeLabel(mediaType)}</span>
            ${post.far_score > 0 ? `<span class="popup-xp">${post.far_score} XP</span>` : ''}
          </div>
        </div>
        
        <div class="popup-body">
          <div class="popup-text">${post.content}</div>
          
          ${post.ai_summary ? `
            <div class="popup-summary">
              <div class="popup-summary-header">AI Summary</div>
              <div class="popup-summary-text">${post.ai_summary}</div>
            </div>
          ` : ''}
          
          ${hasMedia ? `
            <div class="popup-media">
              ${mediaType === 'video' ? `
                <video controls class="popup-video">
                  <source src="${post.media_url}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              ` : ''}
            </div>
          ` : ''}
          
          ${hasSource ? `
            <div class="popup-source">
              <a href="${post.source_url}" target="_blank" rel="noopener noreferrer" class="popup-source-link">
                View Source Article
              </a>
            </div>
          ` : ''}
          
          ${post.credibility_score !== undefined ? `
            <div class="popup-credibility ${post.is_reliable ? 'reliable' : 'unreliable'}">
              Credibility: ${post.credibility_score}/100
            </div>
          ` : ''}
        </div>
        
        <div class="popup-footer">
          <div class="popup-location">
            <span class="popup-coordinates">${post.lat.toFixed(4)}, ${post.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const getMediaTypeLabel = (mediaType?: string) => {
    switch (mediaType) {
      case 'video':
        return 'Video';
      case 'news':
        return 'News';
      default:
        return 'Text';
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Custom CSS for enhanced markers and popups */}
      <style jsx>{`
        .custom-marker {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .marker-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .marker-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .marker-text { background: #fbbf24; }
        .marker-video { background: #ef4444; }
        .marker-news { background: #8b5cf6; }

        .marker-xp {
          background: #fbbf24;
          color: #1f2937;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          margin-top: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .marker-hover .marker-icon {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .custom-popup {
          max-width: 400px;
        }

        .popup-content {
          padding: 0;
          font-family: inherit;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 16px 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .popup-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .popup-avatar {
          width: 32px;
          height: 32px;
          background: #fbbf24;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          color: #1f2937;
        }

        .popup-user-info {
          display: flex;
          flex-direction: column;
        }

        .popup-username {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
        }

        .popup-username-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .popup-username-link:hover .popup-username {
          color: #fbbf24;
          text-decoration: underline;
        }

        .popup-date {
          font-size: 12px;
          color: #6b7280;
        }

        .popup-type {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .popup-type-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-weight: 500;
        }

        .popup-type-badge.video { background: #ef4444; }
        .popup-type-badge.news { background: #8b5cf6; }
        .popup-type-badge.text { background: #fbbf24; }

        .popup-xp {
          background: #fbbf24;
          color: #1f2937;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .popup-body {
          padding: 12px 16px;
        }

        .popup-text {
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 12px;
        }

        .popup-summary {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .popup-summary-header {
          font-weight: 600;
          font-size: 12px;
          color: #1e40af;
          margin-bottom: 6px;
        }

        .popup-summary-text {
          font-size: 12px;
          line-height: 1.4;
          color: #1e40af;
        }

        .popup-media {
          margin-bottom: 12px;
        }

        .popup-video {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          object-fit: cover;
          background: #f3f4f6;
        }

        .popup-source {
          margin-bottom: 12px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .popup-source-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #3b82f6;
          text-decoration: none;
          padding: 6px 8px;
          background: white;
          border-radius: 6px;
          border: 1px solid #dbeafe;
          transition: all 0.2s ease;
        }

        .popup-source-link:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .popup-credibility {
          font-size: 12px;
          padding: 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .popup-credibility.reliable {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .popup-credibility.unreliable {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          color: #92400e;
        }

        .popup-footer {
          padding: 12px 16px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .popup-location {
          font-size: 12px;
          color: #6b7280;
        }

        .popup-coordinates {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
} 