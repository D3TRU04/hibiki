export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  try {
    const auth = process.env.PINATA_JWT;
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Missing PINATA_JWT on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const json = formData.get('json');

      if (file && file instanceof File) {
        const relay = new FormData();
        const fileName = (file as any)?.name && typeof (file as any).name === 'string' ? (file as any).name : 'upload.bin';
        relay.append('file', file, fileName);

        const resp = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth}` },
          body: relay,
        });

        if (!resp.ok) {
          const text = await resp.text();
          return new Response(JSON.stringify({ error: text }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = (await resp.json()) as { IpfsHash: string };
        return new Response(JSON.stringify({ cid: data.IpfsHash }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (typeof json === 'string') {
        const resp = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: json,
        });

        if (!resp.ok) {
          const text = await resp.text();
          return new Response(JSON.stringify({ error: text }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = (await resp.json()) as { IpfsHash: string };
        return new Response(JSON.stringify({ cid: data.IpfsHash }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'No file or json provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Also accept raw JSON body
    const bodyText = await req.text();
    if (bodyText) {
      const authHeaders: HeadersInit = {
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json',
      };
      const resp = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: authHeaders,
        body: bodyText,
      });

      if (!resp.ok) {
        const text = await resp.text();
        return new Response(JSON.stringify({ error: text }), {
          status: resp.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = (await resp.json()) as { IpfsHash: string };
      return new Response(JSON.stringify({ cid: data.IpfsHash }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
      status: 415,
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