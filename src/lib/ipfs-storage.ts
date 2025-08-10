import { pinFileToIPFS, pinJSONToIPFS } from './pinata';
import { 
  IPFSMetadata, 
  IPFSUserProfile, 
  IPFSGlobalState, 
  User, 
  Post, 
  CreatePostData,
  RewardSystem 
} from './types';

export async function uploadBlob(content: Blob): Promise<string> {
  const cid = await pinFileToIPFS(new File([content], 'content.bin'));
  return `ipfs://${cid}`;
}

// Global state management
let globalState: IPFSGlobalState = {
  users: {},
  posts: {},
  last_updated: new Date().toISOString(),
  total_posts: 0,
  total_users: 0
};

// Local cache for better performance
const userCache = new Map<string, User>();
const postCache = new Map<string, Post>();

// Rate limiting (10 minutes between posts per user)
const rateLimitMap = new Map<string, number>();

export class IPFSStorage {
  private static instance: IPFSStorage;
  private globalStateUrl: string | null = null;

  static getInstance(): IPFSStorage {
    if (!IPFSStorage.instance) {
      IPFSStorage.instance = new IPFSStorage();
    }
    return IPFSStorage.instance;
  }

  private constructor() {
    this.loadGlobalState();
  }

  // Initialize global state
  private async loadGlobalState() {
    try {
      // Try pointer API first
      const pointerResp = await fetch('/api/state/latest', { cache: 'no-store' }).catch(() => null as any);
      if (pointerResp && pointerResp.ok) {
        const data = (await pointerResp.json()) as { cid?: string | null };
        if (data?.cid) {
          this.globalStateUrl = `ipfs://${data.cid}`;
        }
      }
      if (this.globalStateUrl) {
        const response = await fetch(this.getIPFSGatewayUrl(this.globalStateUrl));
        if (response.ok) {
          globalState = await response.json();
        }
      }
    } catch {
      console.log('No existing global state found, starting fresh');
    }
  }

  // Save global state to IPFS
  private async saveGlobalState(): Promise<string> {
    try {
      globalState.last_updated = new Date().toISOString();
      const cid = await pinJSONToIPFS(globalState);
      const url = `ipfs://${cid}`;
      this.globalStateUrl = url;
      console.log('Global state saved to IPFS:', url);
      // Update pointer on server (best-effort)
      try {
        await fetch('/api/state/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latest: cid }),
        });
      } catch {}
      return url;
    } catch (error) {
      console.error('Failed to save to IPFS, using local fallback:', error);
      return 'local://global-state.json';
    }
  }

  // User management
  async createUser(userData: Partial<User>): Promise<User> {
    const userId = userData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      email: userData.email,
      wallet_address: userData.wallet_address,
      xrpl_address: userData.xrpl_address,
      far_score: 0,
      contribution_points: 0,
      created_at: now,
      updated_at: now,
    };

    // Store in global state
    globalState.users[userId] = user;
    globalState.total_users++;
    userCache.set(userId, user);

    // Try to save to IPFS if available
      try {
        const userProfile: IPFSUserProfile = {
          ...user,
          posts: []
        };

      const profileCid = await pinJSONToIPFS(userProfile);
        user.ipfs_profile_url = `ipfs://${profileCid}`;
        await this.saveGlobalState();
      } catch (error) {
        console.error('Failed to save user to IPFS:', error);
      user.ipfs_profile_url = `local://user-${userId}.json`;
    }

    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    // Check cache first
    if (userCache.has(userId)) {
      return userCache.get(userId)!;
    }

    // Check global state
    const userData = globalState.users[userId];
    if (userData && typeof userData === 'object') {
      const user = userData as User;
      userCache.set(userId, user);
      return user;
    }

    const profileUrl = globalState.users[userId];
    if (!profileUrl || typeof profileUrl !== 'string') {
      return null;
    }

    try {
      const response = await fetch(this.getIPFSGatewayUrl(profileUrl));
      if (!response.ok) {
        return null;
      }

      const userProfile: IPFSUserProfile = await response.json();
      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        wallet_address: userProfile.wallet_address,
        xrpl_address: userProfile.xrpl_address,
        far_score: userProfile.far_score,
        contribution_points: userProfile.contribution_points,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        ipfs_profile_url: profileUrl
      };

      userCache.set(userId, user);
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUser(userId);
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update global state
    globalState.users[userId] = updatedUser;
    userCache.set(userId, updatedUser);

    // Try to update IPFS profile
      try {
        const userProfile: IPFSUserProfile = {
          ...updatedUser,
          posts: [] // We'll maintain posts separately
        };

      const profileCid = await pinJSONToIPFS(userProfile);
        const profileUrl = `ipfs://${profileCid}`;

        updatedUser.ipfs_profile_url = profileUrl;
        globalState.users[userId] = profileUrl;
        await this.saveGlobalState();
      } catch (error) {
        console.error('Failed to update user on IPFS:', error);
      updatedUser.ipfs_profile_url = `local://user-${userId}.json`;
    }

    return updatedUser;
  }

  // Post management
  async createPost(postData: CreatePostData, user: User): Promise<Post | null> {
    // Check rate limit
    const lastPostTime = rateLimitMap.get(user.id);
    const now = Date.now();
    if (lastPostTime && (now - lastPostTime) < 10 * 60 * 1000) { // 10 minutes
      throw new Error('Rate limit: You can only post once every 10 minutes');
    }

    const postId = crypto.randomUUID();
    const nowISO = new Date().toISOString();

    let mediaUrl: string | undefined;

    // Upload media if provided
    if (postData.mediaFile) {
      try {
        const mediaBlob = new Blob([postData.mediaFile], { type: postData.mediaFile.type });
        const mediaFile = new File([mediaBlob], postData.mediaFile.name, { type: postData.mediaFile.type });
        const mediaCid = await pinFileToIPFS(mediaFile);
        mediaUrl = `ipfs://${mediaCid}`;
      } catch (error) {
        console.error('Failed to upload media to IPFS:', error);
        mediaUrl = `local://media-${postId}.${postData.mediaFile.name.split('.').pop()}`;
      }
    }

    // Derive post/media type from provided file (only 'video' or 'text')
    const derivedPostType: 'text' | 'video' = postData.mediaFile && postData.mediaFile.type?.startsWith('video')
      ? 'video'
      : 'text';

    // Create metadata
    const metadata: IPFSMetadata = {
      title: postData.text.substring(0, 100),
      content: postData.text,
      lat: postData.lat,
      lng: postData.lng,
      timestamp: nowISO,
      user_id: user.id,
      media_url: mediaUrl,
      type: derivedPostType,
      far_score: user.far_score,
      engagement_score: 0
    };

    let metadataUrlFinal: string;

    // Upload metadata
      try {
      const metadataCid = await pinJSONToIPFS(metadata);
        metadataUrlFinal = `ipfs://${metadataCid}`;
      } catch (error) {
        console.error('Failed to upload metadata to IPFS:', error);
      metadataUrlFinal = `local://metadata-${postId}.json`;
    }

    // Create post object
    const post: Post = {
      id: postId,
      user_id: user.id,
      type: derivedPostType,
      content: postData.text,
      lat: postData.lat,
      lng: postData.lng,
      media_url: mediaUrl,
      ipfs_metadata_url: metadataUrlFinal,
      far_score: user.far_score,
      engagement_score: 0,
      flags: 0,
      created_at: nowISO,
      updated_at: nowISO,
      user: user,
      tags: postData.tags || [],
      contributor_id: postData.contributor_id,
      wallet_type: postData.wallet?.type,
      reward_points: undefined,
      post_cid: undefined
    };

    // Store post in global state
    globalState.posts[postId] = post;
    globalState.total_posts++;
    await this.saveGlobalState();

    // Update user's contribution points
    const pointsEarned = this.calculatePointsEarned(derivedPostType, user.far_score);
    user.contribution_points += pointsEarned;
    await this.updateUser(user.id, { contribution_points: user.contribution_points });

    // Update rate limit
    rateLimitMap.set(user.id, now);

    // Cache the post
    postCache.set(postId, post);

    return post;
  }

  // Upload a single file to IPFS
  async uploadFile(file: File): Promise<string> {
    try {
      const fileBlob = new Blob([file], { type: file.type });
      const ipfsFile = new File([fileBlob], file.name, { type: file.type });
      const cid = await pinFileToIPFS(ipfsFile);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  async getPosts(): Promise<Post[]> {
    const posts: Post[] = [];

    for (const [postId, postData] of Object.entries(globalState.posts)) {
      try {
        // Check cache first
        if (postCache.has(postId)) {
          posts.push(postCache.get(postId)!);
          continue;
        }

        // Handle both object and URL formats
        let post: Post;
        if (typeof postData === 'object') {
          // Post is already stored as object in global state
          post = postData as Post;
        } else {
          // Post is stored as URL, try to fetch from IPFS
          const response = await fetch(this.getIPFSGatewayUrl(postData));
          if (response.ok) {
            post = await response.json();
          } else {
            console.error(`Failed to fetch post ${postId} from IPFS`);
            continue;
          }
        }
        
        // Fetch user data
        if (post.user_id) {
          const user = await this.getUser(post.user_id);
          if (user) {
            post.user = user;
          }
        }

        postCache.set(postId, post);
        posts.push(post);
      } catch (error) {
        console.error(`Error fetching post ${postId}:`, error);
      }
    }

    // Sort by creation date (newest first)
    return posts.sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }

  // Reward system
  private calculatePointsEarned(postType: string, userFarScore: number): number {
    let basePoints = 0;
    
    switch (postType) {
      case 'video':
        basePoints = 50;
        break;
      default:
        basePoints = 10;
    }

    // Apply far score multiplier (higher reputation = more points)
    const multiplier = 1 + (userFarScore / 1000);
    return Math.floor(basePoints * multiplier);
  }

  async getRewardSystem(userId: string): Promise<RewardSystem | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const reputationTier = this.calculateReputationTier(user.far_score);
    const engagementMultiplier = this.calculateEngagementMultiplier(user.far_score);

    return {
      far_score: user.far_score,
      contribution_points: user.contribution_points,
      engagement_multiplier: engagementMultiplier,
      reputation_tier: reputationTier,
      xrpl_rewards_enabled: !!user.xrpl_address,
      xrpl_address: user.xrpl_address,
      pending_rewards: Math.floor(user.contribution_points / 100), // 1 XRP per 100 points
      posts_created: 0, // Would need to count from posts
      posts_liked: 0,
      posts_shared: 0,
      days_active: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  private calculateReputationTier(farScore: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (farScore >= 10000) return 'diamond';
    if (farScore >= 5000) return 'platinum';
    if (farScore >= 1000) return 'gold';
    if (farScore >= 100) return 'silver';
    return 'bronze';
  }

  private calculateEngagementMultiplier(farScore: number): number {
    return 1 + (farScore / 10000); // Max 2x multiplier at 10k far score
  }

  // Utility functions
  getIPFSGatewayUrl(ipfsUrl: string): string {
    if (!ipfsUrl.startsWith('ipfs://')) {
      return ipfsUrl;
    }
    
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }

  // Clear caches (useful for testing)
  clearCaches() {
    userCache.clear();
    postCache.clear();
    rateLimitMap.clear();
  }
}

// Export singleton instance
export const ipfsStorage = IPFSStorage.getInstance();