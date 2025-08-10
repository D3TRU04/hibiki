export async function pinFileToIPFS(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name || 'upload.bin');

  const res = await fetch('/api/pinata/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Pinata file upload failed: ${res.status}`);
  }

  const data = (await res.json()) as { cid: string };
  return data.cid;
}

export async function pinJSONToIPFS(jsonObject: unknown): Promise<string> {
  const form = new FormData();
  form.append('json', JSON.stringify(jsonObject));

  const res = await fetch('/api/pinata/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Pinata JSON upload failed: ${res.status}`);
  }

  const data = (await res.json()) as { cid: string };
  return data.cid;
} 