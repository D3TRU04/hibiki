export interface Region {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  coordinates: [number, number]; // [longitude, latitude]
  population?: number;
  timezone?: string;
}

export interface Contributor {
  id: string;
  username: string;
  trustScore: number;
  region: string;
  storyCount: number;
  hasStoryNodeNFT: boolean;
  nftMetadata?: {
    tokenId: string;
    imageUrl: string;
    attributes: Record<string, any>;
  };
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'news' | 'radio' | 'user_story' | 'audio_report';
  region: string;
  contributorId: string;
  contributor: Contributor;
  audioUrl?: string;
  radioStreamUrl?: string;
  newsSource?: string;
  trustScore: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  region: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  country: string;
  language: string;
  tags: string[];
  region: string;
}

export interface FilterOptions {
  type: 'all' | 'news' | 'radio' | 'user_story' | 'audio_report';
  trustLevel: 'all' | 'verified' | 'trusted' | 'new';
  language: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
}

export interface RLUSDTransaction {
  id: string;
  contributorId: string;
  amount: number;
  reason: 'story_reward' | 'tip' | 'bounty';
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
} 