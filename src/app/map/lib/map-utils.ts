import type mapboxgl from 'mapbox-gl';
import type { KleoPost } from '@/lib/types';

export type PostFeature = GeoJSON.Feature<GeoJSON.Point, {
  id: string | undefined;
  contributor_id: string;
  ai_summary: string;
  source_url: string;
}>;

export function postsToFeaturesInBounds(posts: KleoPost[], bounds: mapboxgl.LngLatBounds, limit = 1000): PostFeature[] {
  const features: PostFeature[] = [];
  for (let i = 0; i < posts.length && features.length < limit; i++) {
    const p = posts[i];
    if (typeof p?.lng !== 'number' || typeof p?.lat !== 'number') continue;
    if (!bounds.contains([p.lng, p.lat] as mapboxgl.LngLatLike)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        contributor_id: p.user_id || 'Anonymous',
        ai_summary: p.ai_summary || '',
        source_url: p.source_url || '',
      },
    });
  }
  return features;
}

export function createPostPopupEl(props: { contributor_id?: string; ai_summary?: string; source_url?: string }): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '280px';

  const name = document.createElement('div');
  name.style.fontWeight = '600';
  name.style.marginBottom = '4px';
  name.textContent = props.contributor_id || 'Anonymous';
  wrap.appendChild(name);

  if (props.ai_summary) {
    const sum = document.createElement('div');
    sum.style.fontSize = '12px';
    sum.style.color = '#334155';
    sum.style.marginBottom = '6px';
    sum.textContent = props.ai_summary;
    wrap.appendChild(sum);
  }

  if (props.source_url) {
    const link = document.createElement('a');
    link.href = props.source_url;
    link.target = '_blank';
    link.style.fontSize = '12px';
    link.style.color = '#2563eb';
    link.textContent = 'Open Source';
    wrap.appendChild(link);
  }

  return wrap;
}

export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, delay = 100) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // eslint-disable-next-line no-unused-vars
  function debounced(this: unknown, ...args: TArgs) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  (debounced as unknown as { cancel: () => void }).cancel = () => { if (timer) clearTimeout(timer); };
  return debounced as ((...args: TArgs) => void) & { cancel: () => void };
} 