export interface OpenAIResponse {
  summary: string;
  keywords: string[];
  confidence: number;
}

export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI summarization will be simulated.');
    }
  }

  async generateCompletion(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      return this.simulateCompletion(prompt);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional content summarizer. Provide concise, accurate summaries.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options?.maxTokens || 500,
          temperature: options?.temperature || 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate summary';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return this.simulateCompletion(prompt);
    }
  }

  private simulateCompletion(prompt: string): string {
    // Simulate AI response for development/testing
    if (prompt.includes('credibility')) {
      return 'Credibility Score: 75/100. This article appears to be from a legitimate news source with proper journalistic standards. The content is well-structured and cites appropriate sources.';
    }
    
    if (prompt.includes('news') || prompt.includes('article')) {
      return 'This news article discusses recent developments in the specified location. Key stakeholders include local authorities and community members. The significance lies in its potential impact on local infrastructure and community welfare.';
    }
    
    if (prompt.includes('video')) {
      return 'This video content appears to showcase local events or activities. The main themes include community engagement and regional activities relevant to the geographic location.';
    }
    
    return 'This content provides valuable information relevant to the specified location and context.';
  }

  async parseCredibilityScore(response: string): Promise<{
    score: number;
    explanation: string;
    isReliable: boolean;
  }> {
    const scoreMatch = response.match(/(\d+)\/100|Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 50;
    
    return {
      score,
      explanation: response,
      isReliable: score >= 60
    };
  }

  extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
} 