export interface SummaryRequest {
  content: string;
  title?: string;
  url?: string;
  location?: { lat: number; lng: number };
  mediaType?: 'news' | 'video';
}

export function buildNewsArticlePrompt(request: SummaryRequest): string {
  const { content, title, url, location } = request;
  
  const locationContext = location 
    ? `Location context: Latitude ${location.lat}, Longitude ${location.lng}`
    : '';

  return `
You are an expert news analyst. Please analyze the following news article and provide a comprehensive summary.

${title ? `Title: ${title}` : ''}
${url ? `Source URL: ${url}` : ''}
${locationContext}

Article Content:
${content}

Please provide:
1. A concise 2-3 sentence summary of the main points
2. Key stakeholders or entities involved
3. Geographic relevance (if applicable)
4. Significance or impact of the news
5. Any relevant context or background information

Focus on factual information and avoid speculation. If multiple news sources are being summarized for the same location, present each source as a separate bullet point with clear attribution.

Summary:`.trim();
}

export function buildMultiSourcePrompt(articles: SummaryRequest[]): string {
  const summaries = articles.map((article, index) => {
    return `
Source ${index + 1}: ${article.url || 'Unknown Source'}
Title: ${article.title || 'No title provided'}
Content: ${article.content.substring(0, 1000)}...
    `.trim();
  }).join('\n\n---\n\n');

  return `
You are analyzing multiple news sources for the same geographic location. Please provide a comprehensive summary that synthesizes information from all sources.

${summaries}

Please provide:
• A bullet point for each unique source with its key findings
• Synthesis of common themes across sources
• Any conflicting information between sources
• Overall significance for the location

Format as bullet points for clarity:
`.trim();
}

export function buildVideoSummaryPrompt(request: SummaryRequest): string {
  return `
You are analyzing video content. Please provide a summary based on the available metadata and context.

${request.title ? `Video Title: ${request.title}` : ''}
${request.url ? `Video URL: ${request.url}` : ''}
${request.location ? `Location: ${request.location.lat}, ${request.location.lng}` : ''}

Content Description:
${request.content}

Please provide:
1. Main topic or theme of the video
2. Key messages or takeaways
3. Relevance to the geographic location
4. Any notable visual or audio elements mentioned

Summary:`.trim();
}

export function buildCredibilityAnalysisPrompt(content: string, url: string): string {
  return `
Analyze the credibility of this news article. Consider factors such as:
- Source reliability and reputation
- Factual accuracy and verifiability
- Bias indicators
- Writing quality and professionalism
- Use of reliable sources and citations

Article URL: ${url}
Content: ${content.substring(0, 2000)}

Provide a credibility score from 0-100 and explain your reasoning.
Focus on objective indicators of reliability.

Analysis:`.trim();
} 