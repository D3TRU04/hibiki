'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type mapboxgl from 'mapbox-gl';
import { aiSummaryService } from '@/lib/ai/ai-summary';
import type { Geometry as GeoJSONGeometry, Point as GeoJSONPoint } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import { KleoPost } from '@/lib/types';

let mapboxPrewarmed = false;

const MINIMAL_STYLE: mapboxgl.Style = {
  version: 8,
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#eef2f7' },
    },
  ],
};

interface MapContainerProps {
  posts: KleoPost[];
  onMapClick: (lat: number, lng: number) => void;
  onPostClick?: (post: KleoPost) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export default function MapContainer({ onMapClick, onMapReady, posts = [] }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sourceId = 'posts-source';
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const summaryCacheRef = useRef<Map<string, { summary: string; videos: string[] }>>(new Map());
  const postsRef = useRef<KleoPost[]>(posts);

  useEffect(() => { postsRef.current = posts; }, [posts]);

  const ipfsToGateway = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    return url;
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const init = async () => {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string | undefined;
      if (!accessToken) { console.error('Mapbox access token not found'); return; }

      const mod = await import('mapbox-gl');
      const mapboxgl = mod.default;
      mapboxgl.accessToken = accessToken;
      if (!mapboxPrewarmed) { try { mapboxgl.prewarm(); } catch {} mapboxPrewarmed = true; }

      const styleOption: any = process.env.NEXT_PUBLIC_MAPBOX_FAST_MINIMAL === '1' ? MINIMAL_STYLE : 'mapbox://styles/mapbox/light-v11';

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: styleOption,
        center: [0, 0],
        zoom: 2,
        pitch: 5,
        bearing: 0,
        antialias: false,
        attributionControl: false,
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        crossSourceCollisions: false,
        fadeDuration: 0,
        renderWorldCopies: false,
        localIdeographFontFamily: 'sans-serif',
        prefetchZoomDelta: 0,
        minZoom: 2,
        projection: { name: 'globe' } as any,
      } as mapboxgl.MapboxOptions);

      mapRef.current = map as mapboxgl.Map;

      map.on('load', () => {
        // If for any reason the style is empty, swap to default tiles
        try {
          const style = (map as any).getStyle();
          if (!style || !style.layers || style.layers.length === 0) {
            (map as any).setStyle('mapbox://styles/mapbox/light-v11');
          }
        } catch {}

        // Terrain disabled for performance; sky layer remains for visual quality
        try {
          if (!(map as any).getLayer('sky')) {
            (map as any).addLayer({
              id: 'sky',
              type: 'sky',
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 12,
              },
            } as any);
          }
          if ((map as any).setFog) {
            (map as any).setFog({
              range: [0.8, 10],
              color: '#8fd3ff',
              "horizon-blend": 0.2,
            } as any);
          }
        } catch {}

        map.addSource(sourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 11,
          clusterRadius: 60,
        });

        map.addLayer({
          id: 'clusters', type: 'circle', source: sourceId, filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#a3e635', 20, '#fbbf24', 50, '#fb7185'],
            'circle-radius': ['step', ['get', 'point_count'], 14, 20, 18, 50, 24],
          },
        });

        map.addLayer({
          id: 'cluster-count', type: 'symbol', source: sourceId, filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
          paint: { 'text-color': '#1f2937' },
        });

        map.addLayer({
          id: 'unclustered-point', type: 'circle', source: sourceId, filter: ['!', ['has', 'point_count']],
          minzoom: 3,
          paint: { 'circle-color': '#3b82f6', 'circle-radius': 6, 'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff' },
        });

        map.on('click', 'clusters', (e: mapboxgl.MapLayerMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] }) as mapboxgl.MapboxGeoJSONFeature[];
          const clusterId = features?.[0]?.properties?.cluster_id as number | undefined;
          const source = map.getSource(sourceId) as GeoJSONSource | undefined;
          if (!source || clusterId == null) return;
          source.getClusterExpansionZoom(clusterId, (error?: Error | null, result?: number | null) => {
            if (error || result == null) return;
            const geom = features[0].geometry as GeoJSONGeometry;
            if (geom.type !== 'Point') return;
            const [lng, lat] = (geom as GeoJSONPoint).coordinates as [number, number];
            map.easeTo({ center: [lng, lat], zoom: result });
          });
        });

        // Hover-based AI summary popup
        map.on('mouseenter', 'unclustered-point', async (e: mapboxgl.MapLayerMouseEvent) => {
          const feat = e.features?.[0] as mapboxgl.MapboxGeoJSONFeature | undefined;
          if (!feat) return;
          const geom = feat.geometry as GeoJSONGeometry;
          if (geom.type !== 'Point') return;
          const coords = (geom as GeoJSONPoint).coordinates as [number, number];
          const [lng, lat] = coords;
          const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

          // Close previous popup
          try { if (popupRef.current) popupRef.current.remove(); } catch {}

          // Show loading popup immediately
          const loadingHtml = `
            <div style="width:360px;max-width:360px;display:flex;gap:12px;">
              <div style="flex:1;min-height:80px;color:#111827;font-size:12px;">
                <div style="font-weight:600;margin-bottom:6px;">Summarizing nearby stories…</div>
                <div class="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div style="width:140px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:6px;">
                <span style="font-size:12px;color:#6b7280;">Loading media…</span>
              </div>
            </div>`;
          const newPopup = new (map as any).Popup({ closeButton: true, closeOnClick: false });
          newPopup.setLngLat(coords).setHTML(loadingHtml).addTo(map);
          popupRef.current = newPopup as mapboxgl.Popup;

          // Resolve nearby posts (match by rounded coords)
          const nearby = postsRef.current.filter(p => {
            try {
              return p.lat != null && p.lng != null && p.lat.toFixed(4) === lat.toFixed(4) && p.lng.toFixed(4) === lng.toFixed(4);
            } catch { return false; }
          });

          // Prepare videos list
          const videos = nearby
            .filter(p => p.type === 'video' || p.content_type === 'media' || !!p.media_url)
            .map(p => ipfsToGateway(p.media_url || p.ipfs_post_url))
            .filter(Boolean) as string[];

          // Use cache or generate summary
          let summary = summaryCacheRef.current.get(key)?.summary;
          if (!summary) {
            const newsText = nearby
              .filter(p => (p.type !== 'video'))
              .map(p => p.ai_summary || p.content)
              .filter(Boolean)
              .join('\n\n');
            try {
              const ai = await aiSummaryService.generateSummary({ mediaType: 'news', content: newsText || 'No news content provided.' });
              summary = ai.summary;
            } catch {
              summary = 'Summary unavailable.';
            }
            summaryCacheRef.current.set(key, { summary, videos });
          }

          // Build popup HTML with summary left and videos right
          const videosHtml = videos.length > 0
            ? videos.slice(0, 3).map((v) => `<video src="${v || ''}" controls style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;" preload="metadata"></video>`).join('')
            : '<div style="font-size:12px;color:#6b7280;">No media</div>';
          const html = `
            <div style="width:420px;max-width:420px;display:flex;gap:12px;">
              <div style="flex:1;color:#111827;font-size:12px;line-height:1.4;max-height:160px;overflow:auto;">
                <div style="font-weight:600;margin-bottom:6px;">AI Summary</div>
                <div>${(summary || 'No summary available').replace(/</g,'&lt;')}</div>
              </div>
              <div style="width:160px;">${videosHtml}</div>
            </div>`;
          try { if (popupRef.current) popupRef.current.setHTML(html); } catch {}
        });

        map.on('mouseleave', 'unclustered-point', () => {
          try { if (popupRef.current) popupRef.current.remove(); } catch {}
          popupRef.current = null;
        });

        map.on('click', (e: mapboxgl.MapMouseEvent) => { const { lng, lat } = e.lngLat; onMapClick(lat, lng); });

        if (onMapReady) onMapReady(map);
      });
    };

    void init();

    return () => {
      const map = mapRef.current as mapboxgl.Map | null;
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [onMapClick, onMapReady]);

  useEffect(() => {
    const map = mapRef.current as mapboxgl.Map | null;
    if (!map) return;
    const src = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (!src) return;

    console.log(`🗺️ MapContainer received ${posts.length} posts`);
    console.log(`📍 Posts with coordinates:`, posts.filter(p => p.lat != null && p.lng != null).length);

    // If the dataset is huge, cap to viewport features for faster updates
    const shouldCap = posts.length > 3000;
    const computeFeatures = (): Array<GeoJSON.Feature<GeoJSON.Point, { id?: string; contributor_id: string; ai_summary?: string; source_url?: string }>> => {
      let list = posts;
      if (shouldCap) {
        const b = (map as any).getBounds() as mapboxgl.LngLatBounds;
        list = posts.filter(p => typeof p.lng === 'number' && typeof p.lat === 'number' && b.contains([p.lng, p.lat] as any)).slice(0, 1500);
      }
      type PostProps = { id?: string; contributor_id: string; ai_summary?: string; source_url?: string };
      return list.map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [Number(p.lng.toFixed(5)), Number(p.lat.toFixed(5))] as [number, number] },
        properties: {
          id: p.id,
          contributor_id: p.user_id || 'Anonymous',
          ai_summary: (p as unknown as { ai_summary?: string }).ai_summary || '',
          source_url: (p as unknown as { source_url?: string }).source_url || '',
        },
      }));
    };

    type PostProps = { id?: string; contributor_id: string; ai_summary?: string; source_url?: string };
    const features: Array<GeoJSON.Feature<GeoJSON.Point, PostProps>> = computeFeatures();

    console.log(`🎯 Creating ${features.length} map features from posts`);
    features.forEach((feature, index) => {
      if (index < 5) { // Log first 5 features
        const coords = feature.geometry.coordinates;
        console.log(`📍 Feature ${index}: [${coords[0]}, ${coords[1]}]`);
      }
    });

    const collection: GeoJSON.FeatureCollection<GeoJSON.Point, PostProps> = { type: 'FeatureCollection', features };
    src.setData(collection);

    if (shouldCap) {
      const handler = () => {
        const f = computeFeatures();
        src.setData({ type: 'FeatureCollection', features: f } as any);
      };
      const debounced = (() => {
        let t: any; return () => { clearTimeout(t); t = setTimeout(handler, 120); };
      })();
      (map as any).on('moveend', debounced);
      return () => { (map as any).off('moveend', debounced); };
    }
  }, [posts]);

  return <div ref={mapContainer} className="w-full h-full" />;
} 