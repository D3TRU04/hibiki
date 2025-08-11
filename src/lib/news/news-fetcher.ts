export interface NewsArticle {
  title: string;
  content: string;
  url: string;
  publishedAt?: string;
  author?: string;
  siteName?: string;
  excerpt?: string;
  leadImageUrl?: string;
  wordCount?: number;
}

export class NewsFetcherService {
  private static instance: NewsFetcherService;

  static getInstance(): NewsFetcherService {
    if (!NewsFetcherService.instance) {
      NewsFetcherService.instance = new NewsFetcherService();
    }
    return NewsFetcherService.instance;
  }

  // Fetch and parse news article from URL via server API using Readability + JSDOM
  async fetchArticle(url: string): Promise<NewsArticle | null> {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }

      const res = await fetch(`/api/parse-article?url=${encodeURIComponent(url)}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Article parse failed (${res.status})`);
      }
      const data = await res.json() as { title?: string; content?: string; error?: string };
      if (!data?.content || data.content.length < 100) {
        throw new Error('Insufficient content');
      }

      return {
        title: data.title || 'Untitled Article',
        content: data.content,
        url,
        publishedAt: new Date().toISOString(),
        author: 'Unknown',
        siteName: new URL(url).hostname,
        excerpt: data.content.length > 200 ? data.content.substring(0, 200) + '...' : data.content,
        wordCount: data.content.split(/\s+/).length
      };
    } catch (error) {
      return null;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('https://');
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const newsFetcherService = NewsFetcherService.getInstance(); 