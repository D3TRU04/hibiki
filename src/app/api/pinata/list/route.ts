export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  try {
    const auth = process.env.PINATA_JWT;
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Missing PINATA_JWT on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL('https://api.pinata.cloud/data/pinList');
    url.searchParams.set('status', 'pinned');
    url.searchParams.set('pageLimit', '100');
    url.searchParams.set('includeCount', 'false');

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${auth}` },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: text }), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json() as { rows?: Array<{ ipfs_pin_hash?: string }>; count?: number };
    const cids = Array.isArray(data?.rows) ? data.rows.map(r => r.ipfs_pin_hash).filter(Boolean) : [];

    return new Response(JSON.stringify({ cids }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 