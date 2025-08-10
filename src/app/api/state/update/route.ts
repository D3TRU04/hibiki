export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  try {
    const auth = process.env.PINATA_JWT;
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Missing PINATA_JWT' }), { status: 500 });
    }

    const { latest } = (await req.json().catch(() => ({}))) as { latest?: string };
    if (!latest) {
      return new Response(JSON.stringify({ error: 'Missing latest CID' }), { status: 400 });
    }

    const body = JSON.stringify({ latest, updatedAt: new Date().toISOString() });

    const resp = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json',
        'pinataMetadata': JSON.stringify({ name: 'kleo-global-state-pointer' }),
      } as any,
      body,
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: text }), { status: resp.status });
    }

    const data = (await resp.json()) as { IpfsHash: string };
    return new Response(JSON.stringify({ pointerCid: data.IpfsHash }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
} 