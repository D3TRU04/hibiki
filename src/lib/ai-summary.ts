import { AISummary } from './types';
import { OpenAIClient } from './ai/openai-client';
import { buildNewsArticlePrompt, buildVideoSummaryPrompt, SummaryRequest } from './ai/prompts';

class AISummaryService {
  private openaiClient: OpenAIClient;

  constructor() {
    this.openaiClient = new OpenAIClient();
  }

  async generateSummary(request: SummaryRequest): Promise<AISummary> {
    try {
      const prompt = this.buildPrompt(request);
      const response = await this.openaiClient.generateCompletion(prompt);
      const keywords = this.openaiClient.extractKeywords(request.content);

      return {
        summary: response,
        keywords,
        confidence: 0.85,
        // extra metadata omitted to match AISummary type
      } as AISummary;
    } catch (error) {
      console.error('AI Summary generation failed:', error);
      return this.getFallbackSummary(request);
    }
  }

  private buildPrompt(request: SummaryRequest): string {
    switch (request.mediaType) {
      case 'news':
        return buildNewsArticlePrompt(request);
      case 'video':
        return buildVideoSummaryPrompt(request);
      default:
        return buildNewsArticlePrompt(request);
    }
  }

  private getFallbackSummary(request: SummaryRequest): AISummary {
    const fallbackText = request.mediaType === 'video' 
      ? 'Video content submitted to this location.'
      : 'News article submitted to this location.';

    return {
      summary: fallbackText,
      keywords: ['content', 'location', 'submission'],
      confidence: 0.1,
      // extra metadata omitted
    } as AISummary;
  }
}

export const aiSummaryService = new AISummaryService(); 