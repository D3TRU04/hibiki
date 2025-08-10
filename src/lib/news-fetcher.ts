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

  // Fetch and parse news article from URL using Mercury Parser
  async fetchArticle(url: string): Promise<NewsArticle> {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }

      // Use Mercury Parser for better content extraction
      const article = await this.parseWithMercury(url);
      
      if (!article.content || article.content.length < 100) {
        throw new Error('Unable to extract sufficient content from article');
      }

      return article;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseWithMercury(url: string): Promise<NewsArticle> {
    try {
      // For now, we'll use a simplified Mercury-like parser
      // In production, you'd want to use the actual Mercury Parser library
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const html = await response.text();
      
      // Enhanced content extraction with Mercury-like parsing
      const article = this.extractArticleContent(html, url);
      
      return article;
    } catch (error) {
      console.error('Error parsing with Mercury:', error);
      throw error;
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

  private extractArticleContent(html: string, url: string): NewsArticle {
    // Create a DOM parser for better content extraction
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title with multiple fallbacks
    const title = this.extractTitle(doc);
    
    // Extract main content with Mercury-like selectors
    const content = this.extractMainContent(doc);
    
    // Extract metadata
    const metadata = this.extractMetadata(doc);
    
    // Calculate word count
    const wordCount = content.split(/\s+/).length;
    
    // Extract excerpt (first 200 characters)
    const excerpt = content.length > 200 ? content.substring(0, 200) + '...' : content;
    
    // Extract lead image
    const leadImageUrl = this.extractLeadImage(doc);
    
    return {
      title: this.cleanText(title),
      content: this.cleanText(content),
      url,
      publishedAt: metadata.publishedAt,
      author: metadata.author,
      siteName: metadata.siteName,
      excerpt: this.cleanText(excerpt),
      leadImageUrl,
      wordCount
    };
  }

  private extractTitle(doc: Document): string {
    // Try multiple title selectors in order of preference
    const titleSelectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'h1[class*="title"]',
      'h1[class*="headline"]',
      'h1',
      'title'
    ];
    
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const title = element.getAttribute('content') || element.textContent;
        if (title && title.trim().length > 10) {
          return title.trim();
        }
      }
    }
    
    return 'Untitled Article';
  }

  private extractMainContent(doc: Document): string {
    // Mercury-like content extraction with multiple strategies
    const contentSelectors = [
      // Article-specific selectors
      'article',
      '[role="main"]',
      '[role="article"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.story-content',
      '.content-body',
      '.article-body',
      '.post-body',
      // Generic content selectors
      '.content',
      '.main-content',
      '.text-content',
      'main',
      // Fallback to body
      'body'
    ];
    
    let bestContent = '';
    let bestScore = 0;
    
    for (const selector of contentSelectors) {
      const elements = doc.querySelectorAll(selector);
      
      for (const element of elements) {
        const text = this.extractTextFromElement(element);
        const score = this.calculateContentScore(text);
        
        if (score > bestScore && text.length > 200) {
          bestScore = score;
          bestContent = text;
        }
      }
    }
    
    return bestContent || this.extractTextFromElement(doc.body);
  }

  private extractTextFromElement(element: Element): string {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.social-share', '.comments',
      '.sidebar', '.navigation', '.menu', '.footer'
    ];
    
    const clone = element.cloneNode(true) as Element;
    
    // Remove unwanted elements
    unwantedSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    return clone.textContent || '';
  }

  private calculateContentScore(text: string): number {
    let score = 0;
    
    // Prefer longer content
    score += text.length * 0.1;
    
    // Prefer content with sentences
    const sentences = text.split(/[.!?]+/).length;
    score += sentences * 10;
    
    // Prefer content with paragraphs
    const paragraphs = text.split(/\n\s*\n/).length;
    score += paragraphs * 5;
    
    // Penalize content with too many links or special characters
    const linkCount = (text.match(/http/g) || []).length;
    score -= linkCount * 5;
    
    return score;
  }

  private extractMetadata(doc: Document): {
    publishedAt?: string;
    author?: string;
    siteName?: string;
  } {
    // Extract publication date
    const publishedAt = 
      doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="article:published_time"]')?.getAttribute('content') ||
      doc.querySelector('time[datetime]')?.getAttribute('datetime') ||
      doc.querySelector('.published-date')?.textContent ||
      doc.querySelector('.date')?.textContent;
    
    // Extract author
    const author = 
      doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
      doc.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
      doc.querySelector('.author')?.textContent ||
      doc.querySelector('.byline')?.textContent;
    
    // Extract site name
    const siteName = 
      doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="application-name"]')?.getAttribute('content');
    
    return {
      publishedAt: publishedAt ? this.cleanText(publishedAt) : undefined,
      author: author ? this.cleanText(author) : undefined,
      siteName: siteName ? this.cleanText(siteName) : undefined
    };
  }

  private extractLeadImage(doc: Document): string | undefined {
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      '.lead-image img',
      '.hero-image img',
      '.article-image img',
      '.post-image img',
      'article img',
      '.content img'
    ];
    
    for (const selector of imageSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const src = element.getAttribute('src') || element.getAttribute('data-src');
        if (src && src.startsWith('http')) {
          return src;
        }
      }
    }
    
    return undefined;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }
}

// Export singleton instance
export const newsFetcherService = NewsFetcherService.getInstance(); 