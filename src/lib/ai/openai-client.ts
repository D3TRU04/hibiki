export interface OpenAIResponse {
  summary: string;
  keywords: string[];
  confidence: number;
}

export class OpenAIClient {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      // OpenAI API key not found. AI summarization will be simulated.
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
      // Fallback to simulation if API fails
      return this.simulateCompletion(prompt);
    }
  }

  private simulateCompletion(prompt: string): string {
    // Heuristic: extract content from prompt blocks and summarize 2-3 sentences
    const extractBlock = (label: string): string | null => {
      const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?:\\n\\s*Please provide:|\\n\\s*Summary:|$)`, 'i');
      const match = prompt.match(regex);
      return match?.[1]?.trim() || null;
    };

    const articleContent = extractBlock('Article Content') || extractBlock('Content Description');

    const toSentences = (text: string): string[] => {
      return text
        .replace(/\s+/g, ' ')
        .trim()
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    };

    if (articleContent && articleContent.length > 0) {
      const sentences = toSentences(articleContent);
      if (sentences.length > 0) {
        const summary = sentences.slice(0, 3).join(' ');
        return summary.length > 20 ? summary : (sentences[0] || 'This content references a local event.');
      }
    }

    // Credibility-specific fallback
    if (prompt.toLowerCase().includes('credibility')) {
      return 'Credibility: Source appears generally reliable based on writing quality and verifiable claims. Estimated score: 70/100.';
    }

    // Generic fallbacks by media type cues
    if (prompt.toLowerCase().includes('video')) {
      return 'Short summary: The video highlights a local event and its relevance to the surrounding community.';
    }

    if (prompt.toLowerCase().includes('news') || prompt.toLowerCase().includes('article')) {
      return 'Short summary: The article outlines recent developments and their community impact.';
    }

    return 'Short summary: This content provides updates relevant to the specified location.';
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