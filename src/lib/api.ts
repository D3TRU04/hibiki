import { ipfsStorage } from './ipfs-storage';
import { xrplWallet, distributeRewards } from './xrpl-wallet';
import { Post, CreatePostData, User, RewardSystem, XRPLWallet, KleoPost, Wallet, PostSubmission } from './types';
import { uploadPostMetadata } from './ipfsPostMetadata';
import { calculateRewardPoints, addUserXP, recordPostProof } from './rewards';
import { aiSummaryService } from './ai-summary';
import { newsFetcherService } from './news-fetcher';
import { rateLimiterService } from './rate-limiter';
import { fakeNewsDetectorService, FakeNewsAnalysis } from './fake-news-detector';
import { web3StorageService } from './web3-storage';
import { xrplNFTService } from './xrpl-nft';

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
export async function createKleoPost(postData: PostSubmission, wallet: Wallet): Promise<KleoPost> {
  try {
    // Rate limiting check
    if (!rateLimiterService.canPost(wallet.address)) {
      const timeRemaining = rateLimiterService.getFormattedTimeRemaining(wallet.address);
      throw new Error(`Rate limit exceeded. Please wait ${timeRemaining} before posting again.`);
    }

    let kleoPost: KleoPost;
    let enhancedMetadata: any;

    if (postData.content_type === 'news') {
      // Handle news article submission
      const newsFetcher = NewsFetcherService.getInstance();
      const article = await newsFetcher.fetchArticle(postData.news_url!);
      
      if (!article) {
        throw new Error('Failed to fetch news article content');
      }

      // Check credibility
      const fakeNewsDetector = FakeNewsDetectorService.getInstance();
      const credibility = await fakeNewsDetector.analyzeNewsArticle(postData.news_url!);
      
      if (!credibility.is_reliable) {
        throw new Error(`Article appears to be unreliable. Credibility score: ${credibility.score}/100`);
      }

      // Get AI summary
      const aiSummary = AISummaryService.getInstance();
      const summary = await aiSummary.summarizeNewsArticle(article.content, postData.news_url!);

      kleoPost = {
        id: generateId(),
        user_id: wallet.address,
        type: 'news',
        content: article.title,
        lat: postData.lat,
        lng: postData.lng,
        source_url: postData.news_url,
        ai_summary: summary.summary,
        credibility_score: credibility.score,
        is_reliable: credibility.is_reliable,
        content_type: 'news',
        far_score: 0,
        engagement_score: 0,
        flags: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        processing_info: 'AI verified news article'
      };

      enhancedMetadata = {
        ...kleoPost,
        summary_text: summary.summary,
        keywords: summary.keywords,
        source_url: postData.news_url,
        article_title: article.title,
        article_content: article.content,
        credibility_analysis: credibility
      };
    } else {
      // Handle video upload
      if (!postData.media_file) {
        throw new Error('Video file is required for media posts');
      }

      // Validate video file
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(postData.media_file.type)) {
        throw new Error('Invalid video format. Please upload MP4, WebM, OGG, or MOV files only.');
      }

      if (postData.media_file.size > 5 * 1024 * 1024) {
        throw new Error('Video file size must be less than 5MB');
      }

      // Upload video to IPFS
      const web3Storage = Web3StorageService.getInstance();
      const videoCid = await web3Storage.uploadFile(postData.media_file);

      kleoPost = {
        id: generateId(),
        user_id: wallet.address,
        type: 'video',
        content: postData.content,
        lat: postData.lat,
        lng: postData.lng,
        media_url: `ipfs://${videoCid}`,
        content_type: 'media',
        file_size: postData.media_file.size,
        far_score: 0,
        engagement_score: 0,
        flags: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        processing_info: 'Video uploaded to IPFS'
      };

      enhancedMetadata = {
        ...kleoPost,
        video_cid: videoCid,
        video_type: postData.media_file.type,
        video_size: postData.media_file.size
      };
    }

    // Calculate reward points
    const rewardPoints = calculateRewardPoints(kleoPost, wallet);
    kleoPost.far_score = rewardPoints;

    // Upload enhanced metadata to IPFS
    const web3Storage = Web3StorageService.getInstance();
    const postCid = await web3Storage.uploadPost(kleoPost, enhancedMetadata);

    // Record post proof
    recordPostProof(kleoPost.id, rewardPoints, wallet.address);

    // Record the post
    rateLimiterService.recordPost(wallet.address);

    // Automatically mint NFT
    const xrplNFTService = XRPLNFTService.getInstance();
    await xrplNFTService.mintFromPostCID(postCid, wallet.address);

    return {
      ...kleoPost,
      ipfs_metadata_url: `ipfs://${postCid}`,
      post_cid: postCid
    };

  } catch (error) {
    console.error('Error creating Kleo post:', error);
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

// Get XRPL wallet seed from wallet address
async function getXRPLWalletSeed(walletAddress: string): Promise<string | null> {
  try {
    // Check if user has an XRPL wallet stored
    if (typeof window !== 'undefined') {
      const userWallets = JSON.parse(localStorage.getItem('kleo_user_wallets') || '{}');
      const userWallet = userWallets[walletAddress];
      
      if (userWallet && userWallet.xrplSeed) {
        return userWallet.xrplSeed;
      }
    }
    
    // For MVP, you can implement wallet generation or import here
    // This is a placeholder - you'll need to integrate with your wallet system
    console.log('⚠️ XRPL wallet seed not found for address:', walletAddress);
    return null;
  } catch (error) {
    console.error('❌ Error getting XRPL wallet seed:', error);
    return null;
  }
} 