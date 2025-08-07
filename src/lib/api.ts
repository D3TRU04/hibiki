import { ipfsStorage } from './ipfs-storage';
import { xrplWallet, distributeRewards } from './xrpl-wallet';
import { Post, CreatePostData, User, RewardSystem, XRPLWallet, KleoPost, Wallet } from './types';
import { uploadPostMetadata } from './ipfsPostMetadata';
import { calculateRewardPoints, addUserXP, recordPostProof } from './rewards';

// Local storage for user session
const USER_SESSION_KEY = 'kleo_user_session';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Generate a temporary contributor ID for anonymous submissions
function generateContributorId(): string {
  if (isBrowser) {
    let contributorId = localStorage.getItem('kleo_contributor_id');
    if (!contributorId) {
      contributorId = `anon_${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem('kleo_contributor_id', contributorId);
    }
    return contributorId;
  }
  return `anon_${crypto.randomUUID().slice(0, 8)}`;
}

// Upload file to IPFS
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const cid = await ipfsStorage.uploadFile(file);
    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

// Get posts with filtering
export async function getPosts(filters?: { tag?: string; type?: string }): Promise<KleoPost[]> {
  try {
    const posts = await ipfsStorage.getPosts();
    
    // Convert Post[] to KleoPost[]
    const kleoPosts: KleoPost[] = posts.map(post => ({
      id: post.id || crypto.randomUUID(),
      text: post.content,
      lat: post.lat,
      lng: post.lng,
      ipfs_url: post.ipfs_post_url,
      media_type: post.type as "audio" | "image" | "video",
      tags: post.tags || [],
      created_at: post.created_at || new Date().toISOString(),
      contributor_id: post.contributor_id,
      wallet_type: post.wallet_type,
      reward_points: post.reward_points,
      post_cid: post.post_cid
    }));

    // Apply filters
    let filteredPosts = kleoPosts;

    if (filters?.tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags?.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
      );
    }

    if (filters?.type) {
      filteredPosts = filteredPosts.filter(post => 
        post.media_type === filters.type
      );
    }

    return filteredPosts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Create a new KleoPost with wallet integration
export async function createKleoPost(postData: {
  text: string;
  lat: number;
  lng: number;
  mediaFile?: File;
  tags?: string[];
  contributor_id?: string;
  wallet?: Wallet;
}): Promise<KleoPost | null> {
  try {
    const contributorId = postData.contributor_id || generateContributorId();
    
    // Upload media file to IPFS if provided
    let ipfsUrl: string | undefined;
    let mediaType: "audio" | "image" | "video" | undefined;
    
    if (postData.mediaFile) {
      ipfsUrl = await uploadToIPFS(postData.mediaFile);
      
      // Determine media type
      if (postData.mediaFile.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (postData.mediaFile.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (postData.mediaFile.type.startsWith('video/')) {
        mediaType = 'video';
      }
    }

    // Create the post using existing infrastructure
    const createPostData: CreatePostData = {
      type: mediaType || 'text',
      content: postData.text,
      lat: postData.lat,
      lng: postData.lng,
      mediaFile: postData.mediaFile,
      tags: postData.tags || [],
      contributor_id: contributorId
    };

    // Try to get current user, if not available, create a temporary anonymous user
    let user = await getCurrentUser();
    if (!user) {
      // Create a temporary anonymous user for the submission
      user = await createUser({
        id: contributorId,
        email: undefined,
        wallet_address: undefined,
        xrpl_address: undefined,
        far_score: 0,
        contribution_points: 0
      });
    }

    const post = await ipfsStorage.createPost(createPostData, user);
    
    if (!post) {
      throw new Error('Failed to create post');
    }

    // Create KleoPost with wallet information
    const kleoPost: KleoPost = {
      id: post.id || crypto.randomUUID(),
      text: post.content,
      lat: post.lat,
      lng: post.lng,
      ipfs_url: ipfsUrl || post.ipfs_post_url,
      media_type: mediaType,
      tags: post.tags || [],
      created_at: post.created_at || new Date().toISOString(),
      contributor_id: contributorId,
      wallet_type: postData.wallet?.type,
      reward_points: 0 // Will be calculated below
    };

    // Calculate reward points
    const rewardPoints = calculateRewardPoints(kleoPost);
    kleoPost.reward_points = rewardPoints;

    // Upload metadata to IPFS
    const postCid = await uploadPostMetadata(kleoPost);
    kleoPost.post_cid = postCid;

    // Add XP to user if wallet is connected
    if (postData.wallet?.isConnected && postData.wallet.address) {
      const userXP = addUserXP(postData.wallet.address, rewardPoints);
      console.log(`User earned ${rewardPoints} XP! Total: ${userXP.totalXP}`);
      
      // Record post proof for future RLUSD claims
      await recordPostProof(postCid, postData.wallet.address);
    }

    return kleoPost;
  } catch (error) {
    console.error('Error creating KleoPost:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check local storage for user session
    if (!isBrowser) return null;
    
    const sessionData = localStorage.getItem(USER_SESSION_KEY);
    if (sessionData) {
      const user = JSON.parse(sessionData);
      // Verify user still exists in IPFS
      const verifiedUser = await ipfsStorage.getUser(user.id);
      if (verifiedUser) {
        return verifiedUser;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    const user = await ipfsStorage.createUser(userData);
    
    // Store user session
    if (isBrowser) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const user = await ipfsStorage.updateUser(userId, updates);
    
    if (user && isBrowser) {
      // Update session
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  if (isBrowser) {
    localStorage.removeItem(USER_SESSION_KEY);
  }
}

export async function createPost(postData: CreatePostData): Promise<Post | null> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check honeypot (anti-spam)
    if (postData.honeypot) {
      throw new Error('Spam detected');
    }

    // Create post using IPFS storage
    const post = await ipfsStorage.createPost(postData, user);
    
    if (post) {
      console.log('Post created successfully:', post.id);
      console.log('Points earned:', post.user?.contribution_points);
    }
    
    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getRewardSystem(userId: string): Promise<RewardSystem | null> {
  try {
    return await ipfsStorage.getRewardSystem(userId);
  } catch (error) {
    console.error('Error getting reward system:', error);
    return null;
  }
}

// XRPL Wallet functions
export async function generateWallet(): Promise<XRPLWallet> {
  try {
    return await xrplWallet.generateWallet();
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw error;
  }
}

export async function importWallet(seed: string): Promise<XRPLWallet> {
  try {
    return await xrplWallet.importWallet(seed);
  } catch (error) {
    console.error('Error importing wallet:', error);
    throw error;
  }
}

export async function getWalletBalance(address: string): Promise<number> {
  try {
    return await xrplWallet.getBalance(address);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
}

export async function claimRewards(userId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.xrpl_address) {
      throw new Error('User not found or no XRPL address configured');
    }

    const rewardSystem = await getRewardSystem(userId);
    if (!rewardSystem || rewardSystem.pending_rewards <= 0) {
      throw new Error('No rewards available to claim');
    }

    // Distribute rewards
    const success = await distributeRewards(user.xrpl_address, user.contribution_points);
    
    if (success) {
      // Reset contribution points after successful reward distribution
      await updateUser(userId, { contribution_points: 0 });
      console.log('Rewards claimed successfully');
    }
    
    return success;
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw error;
  }
}

export async function getFaucetFunds(address: string): Promise<boolean> {
  try {
    return await xrplWallet.getFaucetFunds(address);
  } catch (error) {
    console.error('Error getting faucet funds:', error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function uploadAudioFile(): Promise<string | null> {
  console.warn('uploadAudioFile is deprecated. Use createPost with IPFS instead.');
  return null;
} 