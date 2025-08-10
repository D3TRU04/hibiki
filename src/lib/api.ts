import { ipfsStorage } from './ipfs-storage';
import { xrplWallet, distributeRewards } from './xrpl-wallet';
import { Post, CreatePostData, User, RewardSystem, XRPLWallet, KleoPost, Wallet, PostSubmission } from './types';
import { rateLimiterService } from './rate-limiter';

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
    
    // Convert Post[] to KleoPost[] (align with current KleoPost interface)
    const kleoPosts: KleoPost[] = posts.map((post) => {
      const createdAt = post.created_at || new Date().toISOString();
      const isVideo = post.type === 'video';
      return {
      id: post.id || crypto.randomUUID(),
        user_id: post.user_id || post.contributor_id || 'anonymous',
        type: isVideo ? 'video' : 'text',
        content: post.content,
      lat: post.lat,
      lng: post.lng,
        media_url: post.media_url,
        ipfs_metadata_url: post.ipfs_metadata_url,
        ipfs_post_url: post.ipfs_post_url,
        far_score: post.far_score ?? 0,
        engagement_score: post.engagement_score ?? 0,
        flags: post.flags ?? 0,
        created_at: createdAt,
        updated_at: post.updated_at || createdAt,
        ai_summary: undefined,
        source_url: undefined,
        content_type: isVideo ? 'media' : 'news',
        credibility_score: undefined,
        is_reliable: undefined,
      };
    });

    // Apply filters
    let filteredPosts = kleoPosts;

    if (filters?.tag) {
      filteredPosts = filteredPosts.filter(post => 
        false
      );
    }

    if (filters?.type) {
      filteredPosts = filteredPosts.filter(post => 
        post.type === filters.type
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
    const rateInfo = rateLimiterService.canPost(wallet.address);
    if (!rateInfo.canPost) {
      const timeRemaining = rateLimiterService.getFormattedTimeRemaining(rateInfo.timeRemaining);
      throw new Error(`Rate limit exceeded. Please wait ${timeRemaining} before posting again.`);
    }

    let kleoPost: KleoPost;
    let _enhancedMetadata: Record<string, unknown> | undefined;

    if (postData.type === 'news') {
      // Handle news article submission
      const article = await (await import('./news-fetcher')).newsFetcherService.fetchArticle(postData.news_url!);
      
      if (!article) {
        throw new Error('Failed to fetch news article content');
      }

      // Check credibility
      const credibility = await (await import('./fake-news-detector')).fakeNewsDetectorService.analyzeNewsArticle(postData.news_url!, article.content, article.title || '');
      
      if (!credibility.isReliable) {
        throw new Error(`Article appears to be unreliable. Credibility score: ${credibility.score}/100`);
      }

      // Get AI summary
      const ai = (await import('./ai-summary')).aiSummaryService;
      const summary = await ai.generateSummary({ mediaType: 'news', content: article.content, url: postData.news_url! });

      // Create KleoPost object for news (align with current interface)
      kleoPost = {
        id: crypto.randomUUID(),
        user_id: wallet.address,
        type: 'news',
        content: article.content,
        lat: postData.lat,
        lng: postData.lng,
        media_url: undefined,
        ipfs_metadata_url: undefined,
        ipfs_post_url: '',
        far_score: 0,
        engagement_score: 0,
        flags: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_summary: summary.summary,
        source_url: postData.news_url,
        content_type: 'news',
        credibility_score: Math.round(summary.confidence * 100),
        is_reliable: true,
      };

      _enhancedMetadata = {
        ...kleoPost,
        summary_text: summary.summary,
        keywords: summary.keywords,
        source_url: postData.news_url,
        article_title: article.title,
        article_content: article.content,
        credibility_analysis: credibility
      };
    } else {
      // Handle media upload
      let ipfsUrl = '';
      if (postData.media_file) {
        ipfsUrl = await uploadToIPFS(postData.media_file);
      }

      // Create KleoPost object for media (align with current interface)
      kleoPost = {
        id: crypto.randomUUID(),
        user_id: wallet.address,
        type: 'video',
        content: postData.content,
        lat: postData.lat,
        lng: postData.lng,
        media_url: ipfsUrl ? `ipfs://${ipfsUrl}` : undefined,
        ipfs_metadata_url: undefined,
        ipfs_post_url: undefined,
        far_score: 0,
        engagement_score: 0,
        flags: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        content_type: 'media',
      } as KleoPost;
    }

    // Upload post metadata to IPFS (Pinata) & mint NFT
    const cid = await (await import('./pinata-storage')).pinataStorageService.uploadPost(kleoPost);
    kleoPost.ipfs_metadata_url = `ipfs://${cid}`;
    // Mint NFT from the created post metadata if desired (placeholder seed required in real flow)
    // await (await import('./xrpl-nft')).xrplNFTService.mintFromPostCID(kleoPost, '<WALLET_SEED>');

    // Record XP and proofs
    // Minimal XP handling to avoid unused imports; can be re-enabled later
    // const points = calculateRewardPoints(kleoPost, { wallet_address: wallet.address } as User);
    // addUserXP(wallet.address, points);
    // await recordPostProof(cid, wallet.address);

    return kleoPost;

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

    // Honeypot not supported in current CreatePostData shape
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
async function _getXRPLWalletSeed(walletAddress: string): Promise<string | null> {
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