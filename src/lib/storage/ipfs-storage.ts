import { pinFileToIPFS, pinJSONToIPFS } from './pinata';
import { Post, User, RewardSystem } from '../types';

// Simple post cache without global state
const postCache = new Map<string, Post>();

// In-memory storage for posts (since we can't easily query Pinata)
const localPosts = new Map<string, Post>();

// Local storage keys
const POSTS_STORAGE_KEY = 'kleo_local_posts';

export class IPFSStorageService {
  private static instance: IPFSStorageService;

  static getInstance(): IPFSStorageService {
    if (!IPFSStorageService.instance) {
      IPFSStorageService.instance = new IPFSStorageService();
    }
    return IPFSStorageService.instance;
  }

  private constructor() {
    this.loadStoredPosts();
  }

  private loadStoredPosts(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
        if (storedPosts) {
          const posts = JSON.parse(storedPosts) as Post[];
          posts.forEach(post => {
            if (post.id) {
              localPosts.set(post.id, post);
            }
          });
        }
      } catch (error) {
        // Error loading stored posts - handled silently
      }
    }
  }

  private savePostsToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const posts = Array.from(localPosts.values());
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
      } catch (error) {
        // Error saving posts to storage - handled silently
      }
    }
  }

  // Upload post to IPFS via Pinata
  async uploadPost(post: Post): Promise<string> {
    try {
      const postData = {
        id: post.id,
        user_id: post.user_id,
        type: post.type,
        content: post.content,
        lat: post.lat,
        lng: post.lng,
        media_url: post.media_url,
        ipfs_metadata_url: post.ipfs_metadata_url,
        ipfs_post_url: post.ipfs_post_url,
        far_score: post.far_score,
        engagement_score: post.engagement_score,
        flags: post.flags,
        created_at: post.created_at,
        updated_at: post.updated_at,
        tags: post.tags,
        contributor_id: post.contributor_id,
        wallet_type: post.wallet_type,
        reward_points: post.reward_points,
        post_cid: post.post_cid
      };

      const cid = await pinJSONToIPFS(postData);
      
      // Store locally for immediate access
      if (post.id) {
        localPosts.set(post.id, post);
        this.savePostsToStorage(); // Save to storage after successful upload
      }
      
      return cid;
    } catch (error) {
      throw error;
    }
  }

  // Create post from KleoPost (used by API)
  async createPostFromKleo(kleoPost: any): Promise<Post> {
    const post: Post = {
      id: kleoPost.id,
      user_id: kleoPost.user_id || 'anonymous',
      type: kleoPost.type === 'video' ? 'video' : 'text',
      content: kleoPost.content,
      lat: kleoPost.lat,
      lng: kleoPost.lng,
      media_url: kleoPost.media_url || kleoPost.ipfs_metadata_url,
      ipfs_post_url: kleoPost.ipfs_metadata_url,
      far_score: kleoPost.far_score || 0,
      engagement_score: kleoPost.engagement_score || 0,
      flags: kleoPost.flags || 0,
      created_at: kleoPost.created_at,
      updated_at: kleoPost.updated_at || kleoPost.created_at,
      tags: [],
      contributor_id: kleoPost.user_id,
      ipfs_metadata_url: kleoPost.ipfs_metadata_url
    };

    // Persist news metadata onto Post so feed can render
    if (kleoPost.source_url) {
      (post as any).source_url = kleoPost.source_url;
    }
    if (kleoPost.content_type) {
      (post as any).content_type = kleoPost.content_type;
    }

    // Store locally
    if (post.id) {
      localPosts.set(post.id, post);
      this.savePostsToStorage(); // Save to storage after successful creation
    }
    
    return post;
  }

  // Create post directly
  async createPost(postData: any, user: any): Promise<Post> {
    const post: Post = {
      id: postData.id || this.generateId(),
      user_id: user?.id || 'anonymous',
      type: postData.type || 'text',
      content: postData.content,
      lat: postData.lat,
      lng: postData.lng,
      media_url: postData.media_url,
      ipfs_post_url: postData.ipfs_post_url,
      far_score: postData.far_score || 0,
      engagement_score: postData.engagement_score || 0,
      flags: postData.flags || 0,
      created_at: postData.created_at || new Date().toISOString(),
      updated_at: postData.updated_at || new Date().toISOString(),
      tags: postData.tags || [],
      contributor_id: user?.id || 'anonymous',
      ipfs_metadata_url: postData.ipfs_metadata_url
    };

    // Store locally
    if (post.id) {
      localPosts.set(post.id, post);
      this.savePostsToStorage(); // Save to storage after successful creation
    }
    
    return post;
  }

  // Generate a simple ID
  private generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sync from Pinata (placeholder - in a real implementation this would query Pinata API)
  async syncFromPinata(): Promise<void> {
    try {
      const res = await fetch('/api/pinata/list', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { cids?: string[] };
      const cids = Array.isArray(data?.cids) ? data.cids.slice(0, 200) : [];
      for (const cid of cids) {
        try {
          const metaRes = await fetch(`https://ipfs.io/ipfs/${cid}`, { cache: 'no-store' });
          if (!metaRes.ok) continue;
          const meta = await metaRes.json();
          const post: Post = {
            id: String(meta.id || cid),
            user_id: String(meta.user_id || meta.wallet_address || 'anonymous'),
            type: (meta.type === 'video' ? 'video' : 'text') as Post['type'],
            content: String(meta.content || meta.summary || ''),
            lat: Number(meta.lat || 0),
            lng: Number(meta.lng || 0),
            media_url: typeof meta.media_url === 'string' ? meta.media_url : undefined,
            ipfs_metadata_url: `ipfs://${cid}`,
            ipfs_post_url: typeof meta.ipfs_post_url === 'string' ? meta.ipfs_post_url : undefined,
            far_score: Number(meta.far_score || 0),
            engagement_score: Number(meta.engagement_score || 0),
            flags: Number(meta.flags || 0),
            created_at: String(meta.created_at || new Date().toISOString()),
            updated_at: String(meta.updated_at || meta.created_at || new Date().toISOString()),
            tags: Array.isArray(meta.tags) ? meta.tags as string[] : [],
            contributor_id: String(meta.contributor_id || meta.user_id || ''),
          };
          if (post.id) {
            localPosts.set(post.id, post);
          }
        } catch {}
      }
      this.savePostsToStorage();
    } catch {}
  }

  // Get all posts (returns locally stored posts)
  async getPosts(): Promise<Post[]> {
    // Ensure we have the latest data from storage
    this.loadStoredPosts();
    return Array.from(localPosts.values());
  }

  // Manual sync from localStorage (useful for debugging)
  async syncFromLocalStorage(): Promise<void> {
    this.loadStoredPosts();
  }

  // Get post from IPFS
  async getPost(cid: string): Promise<Post | null> {
    try {
      // Check cache first
      if (postCache.has(cid)) {
        return postCache.get(cid)!;
      }

      // Fetch from IPFS gateway
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }
      
      const post = await response.json() as Post;
      
      // Cache the post
      postCache.set(cid, post);
      
      return post;
    } catch (error) {
      return null;
    }
  }

  // Get multiple posts from IPFS by CIDs
  async getPostsByCids(cids: string[]): Promise<Post[]> {
    const posts: Post[] = [];
    
    for (const cid of cids) {
      const post = await this.getPost(cid);
      if (post) {
        posts.push(post);
      }
    }
    
    return posts;
  }

  // Upload media file to IPFS via Pinata
  async uploadMedia(file: File): Promise<string> {
    try {
      const cid = await pinFileToIPFS(file);
      return cid;
    } catch (error) {
      throw error;
    }
  }

  // Get IPFS gateway URL
  getGatewayUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }

  // Clear cache (useful for memory management)
  clearCache(): void {
    postCache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return postCache.size;
  }

  // Get local posts count
  getLocalPostsCount(): number {
    return localPosts.size;
  }

  // Clear local posts (useful for testing)
  clearLocalPosts(): void {
    localPosts.clear();
    this.savePostsToStorage(); // Clear storage as well
  }

  // User management methods
  async getUser(userId: string): Promise<User | null> {
    try {
      // Check if we have the user in local storage first
      const userKey = `user_${userId}`;
      const userData = localStorage.getItem(userKey);
      
      if (userData) {
        return JSON.parse(userData) as User;
      }

      // If not in local storage, try to fetch from IPFS
      // This would require storing user IPFS CIDs somewhere
      // For now, return null if user doesn't exist
      return null;
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user: User = {
        id: userData.id || this.generateId(),
        email: userData.email,
        wallet_address: userData.wallet_address,
        xrpl_address: userData.xrpl_address,
        far_score: userData.far_score || 0,
        contribution_points: userData.contribution_points || 0,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
        ipfs_profile_url: userData.ipfs_profile_url
      };
      
      // Upload user profile to IPFS
      const userProfile = {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        xrpl_address: user.xrpl_address,
        far_score: user.far_score,
        contribution_points: user.contribution_points,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      const cid = await pinJSONToIPFS(userProfile);
      user.ipfs_profile_url = cid;
      
      // Store user in local storage for quick access
      const userKey = `user_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const existingUser = await this.getUser(userId);
      if (!existingUser) {
        return null;
      }

      const updatedUser: User = {
        ...existingUser,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update user profile in IPFS
      const userProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        wallet_address: updatedUser.wallet_address,
        xrpl_address: updatedUser.xrpl_address,
        far_score: updatedUser.far_score,
        contribution_points: updatedUser.contribution_points,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      };
      
      const cid = await pinJSONToIPFS(userProfile);
      updatedUser.ipfs_profile_url = cid;
      
      // Update in local storage
      const userKey = `user_${userId}`;
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      return null;
    }
  }

  async getRewardSystem(userId: string): Promise<RewardSystem | null> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return null;
      }

      // Create reward system based on user data
      const rewardSystem: RewardSystem = {
        far_score: user.far_score,
        contribution_points: user.contribution_points,
        engagement_multiplier: this.calculateEngagementMultiplier(user.contribution_points),
        reputation_tier: this.calculateReputationTier(user.far_score),
        xrpl_rewards_enabled: !!user.xrpl_address,
        xrpl_address: user.xrpl_address,
        pending_rewards: 0, // This would be calculated from actual rewards
        posts_created: 0, // This would be calculated from actual posts
        posts_liked: 0, // This would be calculated from actual interactions
        posts_shared: 0, // This would be calculated from actual interactions
        days_active: this.calculateDaysActive(user.created_at)
      };
      
      return rewardSystem;
    } catch (error) {
      return null;
    }
  }

  private calculateEngagementMultiplier(contributionPoints: number): number {
    if (contributionPoints >= 1000) return 2.0;
    if (contributionPoints >= 500) return 1.5;
    if (contributionPoints >= 100) return 1.2;
    return 1.0;
  }

  private calculateReputationTier(farScore: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (farScore >= 10000) return 'diamond';
    if (farScore >= 5000) return 'platinum';
    if (farScore >= 1000) return 'gold';
    if (farScore >= 100) return 'silver';
    return 'bronze';
  }

  private calculateDaysActive(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async addPostToGlobalState(post: Post): Promise<void> {
    try {
      // Add post to local storage
      if (post.id) {
        localPosts.set(post.id, post);
        this.savePostsToStorage(); // Save to storage after successful addition
      }
      
      // In a real implementation, this would also update a global state in IPFS
      // For now, just store locally
    } catch (error) {
      // Error adding post to global state - handled silently
    }
  }
}

// Export singleton instance
export const ipfsStorageService = IPFSStorageService.getInstance();

// Export alias for compatibility with existing code
export const ipfsStorage = ipfsStorageService;