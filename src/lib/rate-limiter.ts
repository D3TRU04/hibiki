import { RateLimitInfo } from './types';

const RATE_LIMIT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_STORAGE_KEY = 'kleo_rate_limit';

interface RateLimitData {
  [walletAddress: string]: {
    lastPostTime: number;
  };
}

export class RateLimiterService {
  private static instance: RateLimiterService;

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  // Check if user can post
  canPost(walletAddress: string): RateLimitInfo {
    if (!walletAddress) {
      return {
        canPost: false,
        timeRemaining: 0
      };
    }

    const rateLimitData = this.getRateLimitData();
    const userData = rateLimitData[walletAddress];
    
    if (!userData) {
      return {
        canPost: true,
        timeRemaining: 0
      };
    }

    const timeSinceLastPost = Date.now() - userData.lastPostTime;
    const timeRemaining = Math.max(0, RATE_LIMIT_DURATION - timeSinceLastPost);
    
    return {
      canPost: timeRemaining <= 0,
      timeRemaining,
      lastPostTime: userData.lastPostTime
    };
  }

  // Record a post submission
  recordPost(walletAddress: string): void {
    if (!walletAddress) return;

    const rateLimitData = this.getRateLimitData();
    rateLimitData[walletAddress] = {
      lastPostTime: Date.now()
    };
    
    this.saveRateLimitData(rateLimitData);
  }

  // Get formatted time remaining
  getFormattedTimeRemaining(timeRemaining: number): string {
    if (timeRemaining <= 0) return '0:00';
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Clear rate limit for a wallet (for testing)
  clearRateLimit(walletAddress: string): void {
    if (!walletAddress) return;

    const rateLimitData = this.getRateLimitData();
    delete rateLimitData[walletAddress];
    this.saveRateLimitData(rateLimitData);
  }

  private getRateLimitData(): RateLimitData {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading rate limit data:', error);
      return {};
    }
  }

  private saveRateLimitData(data: RateLimitData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving rate limit data:', error);
    }
  }
}

// Export singleton instance
export const rateLimiterService = RateLimiterService.getInstance(); 