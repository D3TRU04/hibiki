export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  try {
    const auth = process.env.PINATA_JWT;
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Missing PINATA_JWT' }), { status: 500 });
    }

    // Find the most recent pin with our pointer name
    const listUrl = new URL('https://api.pinata.cloud/data/pinList');
    listUrl.searchParams.set('status', 'pinned');
    listUrl.searchParams.set('metadata[name]', 'kleo-global-state-pointer');
    listUrl.searchParams.set('pageLimit', '1');
    listUrl.searchParams.set('order', 'DESC');

    const listResp = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${auth}` },
      cache: 'no-store',
    });

    if (!listResp.ok) {
      const text = await listResp.text();
      return new Response(JSON.stringify({ error: text }), { status: listResp.status });
    }

    const listData = (await listResp.json()) as { rows?: Array<{ ipfs_pin_hash: string }> };
    const pointerCid = listData.rows?.[0]?.ipfs_pin_hash;
    if (!pointerCid) {
      return new Response(JSON.stringify({ cid: null }), { status: 200 });
    }

    // Fetch pointer JSON which contains { latest: '<cid>' }
    const pointerResp = await fetch(`https://ipfs.io/ipfs/${pointerCid}`);
    if (!pointerResp.ok) {
      return new Response(JSON.stringify({ cid: null }), { status: 200 });
    }

    const pointerJson = (await pointerResp.json()) as { latest?: string; updatedAt?: string };
    return new Response(JSON.stringify({ cid: pointerJson.latest || null, pointerCid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
} 