// Simple rate limiter with basic cooldown
interface RateLimitData {
  [walletAddress: string]: {
    lastPostTime: number;
  };
}

interface RateLimitInfo {
  canPost: boolean;
  timeRemaining: number;
  lastPostTime?: number;
}

class SimpleRateLimiter {
  private static instance: SimpleRateLimiter;
  private rateLimitMap: RateLimitData = {};
  private cooldownMs: number = 10 * 60 * 1000; // 10 minutes

  static getInstance(): SimpleRateLimiter {
    if (!SimpleRateLimiter.instance) {
      SimpleRateLimiter.instance = new SimpleRateLimiter();
    }
    return SimpleRateLimiter.instance;
  }

  // Check if user can post
  canUserPost(walletAddress: string): RateLimitInfo {
    const now = Date.now();
    const userData = this.rateLimitMap[walletAddress];
    
    if (!userData) {
      return {
        canPost: true,
        timeRemaining: 0
      };
    }

    const timeSinceLastPost = now - userData.lastPostTime;
    const timeRemaining = Math.max(0, this.cooldownMs - timeSinceLastPost);
    const canPost = timeRemaining === 0;

    return {
      canPost,
      timeRemaining,
      lastPostTime: userData.lastPostTime
    };
  }

  // Record a post
  recordPost(walletAddress: string): void {
    this.rateLimitMap[walletAddress] = {
      lastPostTime: Date.now()
    };
  }

  // Get remaining time for user
  getTimeRemaining(walletAddress: string): number {
    const userData = this.rateLimitMap[walletAddress];
    if (!userData) return 0;

    const now = Date.now();
    const timeSinceLastPost = now - userData.lastPostTime;
    return Math.max(0, this.cooldownMs - timeSinceLastPost);
  }

  // Clear rate limit for a user (useful for testing)
  clearRateLimit(walletAddress: string): void {
    delete this.rateLimitMap[walletAddress];
  }

  // Clear all rate limits
  clearAllRateLimits(): void {
    this.rateLimitMap = {};
  }

  // Set custom cooldown time
  setCooldownTime(ms: number): void {
    this.cooldownMs = ms;
  }
}

// Export singleton instance
export const simpleRateLimiter = SimpleRateLimiter.getInstance();

// Export alias for compatibility with existing code
export const rateLimiterService = simpleRateLimiter;

// Export types for compatibility
export type { RateLimitInfo }; 