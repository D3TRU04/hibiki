'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type mapboxgl from 'mapbox-gl';
import type { Geometry as GeoJSONGeometry, Point as GeoJSONPoint } from 'geojson';
import type { Map, GeoJSONSource } from 'mapbox-gl';
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
  onMapReady?: (map: Map) => void;
}

export default function MapContainer({ onMapClick, onMapReady, posts = [] }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceId = 'posts-source';

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const init = async () => {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string | undefined;
      if (!accessToken) { console.error('Mapbox access token not found'); return; }

      const mod = await import('mapbox-gl');
      const mapboxgl = mod.default;
      mapboxgl.accessToken = accessToken;
      if (!mapboxPrewarmed) { try { mapboxgl.prewarm(); } catch {} mapboxPrewarmed = true; }

      const styleOption: any = process.env.NEXT_PUBLIC_MAPBOX_FAST_MINIMAL === '1' ? MINIMAL_STYLE : 'mapbox://styles/mapbox/satellite-streets-v12';

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: styleOption,
        center: [0, 0],
        zoom: 2,
        pitch: 30,
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

      mapRef.current = map as Map;

      map.on('load', () => {
        // If for any reason the style is empty, swap to default tiles
        try {
          const style = (map as any).getStyle();
          if (!style || !style.layers || style.layers.length === 0) {
            (map as any).setStyle('mapbox://styles/mapbox/satellite-streets-v12');
          }
        } catch {}

        // Add DEM source for terrain and enable terrain for 3D relief
        try {
          if (!(map as any).getSource('mapbox-dem')) {
            (map as any).addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
          }
          (map as any).setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
        } catch {}

        // Add atmospheric sky for a more Earth-like appearance
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

        map.on('click', 'unclustered-point', (e: mapboxgl.MapLayerMouseEvent) => {
          const feat = e.features?.[0] as mapboxgl.MapboxGeoJSONFeature | undefined;
          if (!feat) return;
          const geom = feat.geometry as GeoJSONGeometry;
          if (geom.type !== 'Point') return;
          const coords = (geom as GeoJSONPoint).coordinates as [number, number];
          const props = feat.properties as Record<string, unknown>;
          const html = `
            <div style="max-width:280px;">
              <div style="font-weight:600;margin-bottom:4px;">${(props.contributor_id as string) || 'Anonymous'}</div>
              ${props.ai_summary ? `<div style=\"font-size:12px;color:#334155;margin-bottom:6px;\">${String(props.ai_summary)}</div>` : ''}
              ${props.source_url ? `<a href=\"${String(props.source_url)}\" target=\"_blank\" style=\"font-size:12px;color:#2563eb;\">Open Source</a>` : ''}
            </div>
          `;
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true }).setLngLat(coords).setHTML(html).addTo(map);
        });

        map.on('click', (e: mapboxgl.MapMouseEvent) => { const { lng, lat } = e.lngLat; onMapClick(lat, lng); });

        if (onMapReady) onMapReady(map);
      });
    };

    void init();

    return () => {
      const map = mapRef.current as Map | null;
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [onMapClick, onMapReady]);

  useEffect(() => {
    const map = mapRef.current as Map | null;
    if (!map) return;
    const src = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (!src) return;

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