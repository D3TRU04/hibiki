export interface FakeNewsAnalysis {
  isReliable: boolean;
  confidence: number;
  score: number; // 0-100, higher = more reliable
  reasons: string[];
  sourceCredibility: 'high' | 'medium' | 'low';
  contentAnalysis: {
    hasFactualClaims: boolean;
    hasEmotionalLanguage: boolean;
    hasMultipleSources: boolean;
    hasAuthorInfo: boolean;
    hasPublicationDate: boolean;
  };
  recommendations: string[];
}

export interface NewsSource {
  domain: string;
  credibility: 'high' | 'medium' | 'low';
  category: 'mainstream' | 'independent' | 'satire' | 'conspiracy' | 'unknown';
  factCheckRating?: number; // 0-100
}

type ContentAnalysis = {
  hasFactualClaims: boolean;
  hasEmotionalLanguage: boolean;
  hasMultipleSources: boolean;
  hasAuthorInfo: boolean;
  hasPublicationDate: boolean;
};

export class FakeNewsDetectorService {
  private static instance: FakeNewsDetectorService;

  // Known reliable news sources
  private reliableSources: NewsSource[] = [
    // Mainstream high-credibility sources
    { domain: 'reuters.com', credibility: 'high', category: 'mainstream', factCheckRating: 95 },
    { domain: 'ap.org', credibility: 'high', category: 'mainstream', factCheckRating: 95 },
    { domain: 'bbc.com', credibility: 'high', category: 'mainstream', factCheckRating: 90 },
    { domain: 'npr.org', credibility: 'high', category: 'mainstream', factCheckRating: 90 },
    { domain: 'pbs.org', credibility: 'high', category: 'mainstream', factCheckRating: 90 },
    { domain: 'nytimes.com', credibility: 'high', category: 'mainstream', factCheckRating: 85 },
    { domain: 'washingtonpost.com', credibility: 'high', category: 'mainstream', factCheckRating: 85 },
    { domain: 'wsj.com', credibility: 'high', category: 'mainstream', factCheckRating: 85 },
    { domain: 'cnn.com', credibility: 'medium', category: 'mainstream', factCheckRating: 75 },
    { domain: 'foxnews.com', credibility: 'medium', category: 'mainstream', factCheckRating: 70 },
    { domain: 'msnbc.com', credibility: 'medium', category: 'mainstream', factCheckRating: 75 },
    { domain: 'abcnews.go.com', credibility: 'medium', category: 'mainstream', factCheckRating: 75 },
    { domain: 'cbsnews.com', credibility: 'medium', category: 'mainstream', factCheckRating: 75 },
    { domain: 'nbcnews.com', credibility: 'medium', category: 'mainstream', factCheckRating: 75 },
    
    // Independent but credible sources
    { domain: 'propublica.org', credibility: 'high', category: 'independent', factCheckRating: 90 },
    { domain: 'theintercept.com', credibility: 'medium', category: 'independent', factCheckRating: 75 },
    { domain: 'motherjones.com', credibility: 'medium', category: 'independent', factCheckRating: 70 },
    
    // Known unreliable sources
    { domain: 'infowars.com', credibility: 'low', category: 'conspiracy', factCheckRating: 10 },
    { domain: 'breitbart.com', credibility: 'low', category: 'conspiracy', factCheckRating: 20 },
    { domain: 'naturalnews.com', credibility: 'low', category: 'conspiracy', factCheckRating: 15 },
    { domain: 'theonion.com', credibility: 'low', category: 'satire', factCheckRating: 0 },
    { domain: 'babylonbee.com', credibility: 'low', category: 'satire', factCheckRating: 0 },
  ];

  static getInstance(): FakeNewsDetectorService {
    if (!FakeNewsDetectorService.instance) {
      FakeNewsDetectorService.instance = new FakeNewsDetectorService();
    }
    return FakeNewsDetectorService.instance;
  }

  // Main fake news detection method
  async analyzeNewsArticle(url: string, content: string, title: string): Promise<FakeNewsAnalysis> {
    try {
      const domain = this.extractDomain(url);
      const sourceInfo = this.getSourceInfo(domain);
      
      // Analyze content for fake news indicators
      const contentAnalysis = this.analyzeContent(content, title);
      
      // Calculate overall reliability score
      const score = this.calculateReliabilityScore(sourceInfo, contentAnalysis);
      
      // Determine if article is reliable
      const isReliable = score >= 60; // Threshold for reliability
      
      // Generate reasons and recommendations
      const reasons = this.generateReasons(sourceInfo, contentAnalysis, score);
      const recommendations = this.generateRecommendations(sourceInfo, contentAnalysis, score);
      
      return {
        isReliable,
        confidence: Math.min(score / 100, 0.95), // Confidence based on score
        score,
        reasons,
        sourceCredibility: sourceInfo.credibility,
        contentAnalysis,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing news article:', error);
      // Default to unreliable if analysis fails
      return {
        isReliable: false,
        confidence: 0.5,
        score: 30,
        reasons: ['Unable to verify article credibility'],
        sourceCredibility: 'low',
        contentAnalysis: {
          hasFactualClaims: false,
          hasEmotionalLanguage: false,
          hasMultipleSources: false,
          hasAuthorInfo: false,
          hasPublicationDate: false
        },
        recommendations: ['Please verify this article from multiple sources before sharing']
      };
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase().replace('www.', '');
    } catch {
      return '';
    }
  }

  private getSourceInfo(domain: string): NewsSource {
    const knownSource = this.reliableSources.find(source => 
      source.domain === domain || domain.includes(source.domain)
    );
    
    if (knownSource) {
      return knownSource;
    }
    
    // Default to unknown source
    return {
      domain,
      credibility: 'low',
      category: 'unknown',
      factCheckRating: 30
    };
  }

  private analyzeContent(content: string, title: string): ContentAnalysis {
    const fullText = `${title} ${content}`.toLowerCase();
    
    // Check for factual claims (numbers, dates, statistics)
    const hasFactualClaims = /\d{4}|\d+%|\d+\.\d+|\$\d+|\d+ million|\d+ billion/.test(fullText);
    
    // Check for emotional language
    const emotionalWords = [
      'shocking', 'outrageous', 'scandalous', 'incredible', 'amazing', 'terrible',
      'horrible', 'disgusting', 'unbelievable', 'stunning', 'devastating',
      'conspiracy', 'cover-up', 'secret', 'exposed', 'revealed', 'leaked'
    ];
    const hasEmotionalLanguage = emotionalWords.some(word => fullText.includes(word));
    
    // Check for multiple sources (mentions of other news outlets)
    const sourceMentions = ['according to', 'reported by', 'sources say', 'officials said', 'experts say'];
    const hasMultipleSources = sourceMentions.some(phrase => fullText.includes(phrase));
    
    // Check for author information
    const hasAuthorInfo = /by [a-z]+ [a-z]+|author:|written by/i.test(fullText);
    
    // Check for publication date
    const hasPublicationDate = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|published|updated/i.test(fullText);
    
    return {
      hasFactualClaims,
      hasEmotionalLanguage,
      hasMultipleSources,
      hasAuthorInfo,
      hasPublicationDate
    };
  }

  private calculateReliabilityScore(sourceInfo: NewsSource, contentAnalysis: ContentAnalysis): number {
    let score = 50; // Base score
    
    // Source credibility (40% weight)
    switch (sourceInfo.credibility) {
      case 'high':
        score += 30;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score -= 20;
        break;
    }
    
    // Content analysis (60% weight)
    if (contentAnalysis.hasFactualClaims) score += 10;
    if (!contentAnalysis.hasEmotionalLanguage) score += 15;
    if (contentAnalysis.hasMultipleSources) score += 10;
    if (contentAnalysis.hasAuthorInfo) score += 5;
    if (contentAnalysis.hasPublicationDate) score += 5;
    
    // Penalties for suspicious indicators
    if (contentAnalysis.hasEmotionalLanguage) score -= 10;
    if (!contentAnalysis.hasFactualClaims) score -= 5;
    if (!contentAnalysis.hasAuthorInfo) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateReasons(sourceInfo: NewsSource, contentAnalysis: ContentAnalysis, _score: number): string[] {
    const reasons: string[] = [];
    
    // Source-based reasons
    if (sourceInfo.credibility === 'high') {
      reasons.push('Source is a well-established, credible news outlet');
    } else if (sourceInfo.credibility === 'low') {
      reasons.push('Source has a history of unreliable reporting');
    }
    
    // Content-based reasons
    if (contentAnalysis.hasFactualClaims) {
      reasons.push('Article contains verifiable facts and data');
    }
    if (!contentAnalysis.hasEmotionalLanguage) {
      reasons.push('Article uses neutral, objective language');
    }
    if (contentAnalysis.hasMultipleSources) {
      reasons.push('Article cites multiple sources');
    }
    if (contentAnalysis.hasAuthorInfo) {
      reasons.push('Article includes author information');
    }
    if (contentAnalysis.hasPublicationDate) {
      reasons.push('Article includes publication date');
    }
    
    // Warning reasons
    if (contentAnalysis.hasEmotionalLanguage) {
      reasons.push('Article uses emotional or sensational language');
    }
    if (!contentAnalysis.hasFactualClaims) {
      reasons.push('Article lacks verifiable facts');
    }
    
    return reasons;
  }

  private generateRecommendations(sourceInfo: NewsSource, contentAnalysis: ContentAnalysis, score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 60) {
      recommendations.push('Verify this information from multiple credible sources');
      recommendations.push('Check fact-checking websites like Snopes or FactCheck.org');
    }
    
    if (sourceInfo.credibility === 'low') {
      recommendations.push('Consider sharing from a more reputable news source');
    }
    
    if (contentAnalysis.hasEmotionalLanguage) {
      recommendations.push('Be cautious of articles with sensational language');
    }
    
    if (!contentAnalysis.hasFactualClaims) {
      recommendations.push('Look for articles with specific facts and data');
    }
    
    return recommendations;
  }

  // Check if a URL is from a known unreliable source
  isKnownUnreliableSource(url: string): boolean {
    const domain = this.extractDomain(url);
    const sourceInfo = this.getSourceInfo(domain);
    return sourceInfo.credibility === 'low' || sourceInfo.category === 'satire';
  }

  // Get source credibility for display
  getSourceCredibility(url: string): { credibility: string; category: string; rating: number } {
    const domain = this.extractDomain(url);
    const sourceInfo = this.getSourceInfo(domain);
    return {
      credibility: sourceInfo.credibility,
      category: sourceInfo.category,
      rating: sourceInfo.factCheckRating || 0
    };
  }
}

// Export singleton instance
export const fakeNewsDetectorService = FakeNewsDetectorService.getInstance(); 