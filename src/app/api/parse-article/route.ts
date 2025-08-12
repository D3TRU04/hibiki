import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url') || '';

    if (!url || !isValidHttpsUrl(url)) {
      return NextResponse.json({ error: 'Invalid or missing url' }, { status: 400 });
    }

    const htmlResp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
      },
      cache: 'no-store'
    });
    if (!htmlResp.ok) {
      return NextResponse.json({ error: `Failed to fetch article (${htmlResp.status})` }, { status: 502 });
    }

    const html = await htmlResp.text();

    const { JSDOM } = await import('jsdom');
    const { Readability } = await import('@mozilla/readability');

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    let title = article?.title || '';
    let content = (article?.textContent || '').trim();

    if (!content || content.length < 200) {
      // Fallback to basic text extraction
      const doc = dom.window.document;
      const text = doc.body?.textContent || '';
      content = text.replace(/\s+/g, ' ').trim();
    }

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 422 });
    }

    if (!title) {
      title = dom.window.document.title || 'Untitled Article';
    }

    return NextResponse.json({ title, content });
  } catch (e: any) {
    return NextResponse.json({ error: 'Parser error' }, { status: 500 });
  }
}

function isValidHttpsUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
} 