import { ipfsStorage } from './ipfs-storage';
import { xrplWallet, distributeRewards } from './xrpl-wallet';
import { Post, CreatePostData, User, RewardSystem, XRPLWallet } from './types';

// Local storage for user session
const USER_SESSION_KEY = 'kleo_user_session';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

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

export async function getPosts(): Promise<Post[]> {
  try {
    return await ipfsStorage.getPosts();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
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