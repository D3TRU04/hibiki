import { KleoPost, Wallet, PostSubmission } from './types';
import { calculateRewardPoints, addUserXP, recordPostProof } from './rewards';
import { aiSummaryService } from './ai-summary';
import { newsFetcherService } from './news-fetcher';
import { rateLimiterService } from './rate-limiter';
import { fakeNewsDetectorService } from './fake-news-detector';
import { web3StorageService } from './web3-storage';
import { xrplNFTService } from './xrpl-nft';

// Generate a temporary contributor ID for anonymous submissions
function generateContributorId(): string {
  if (typeof window !== 'undefined') {
    let contributorId = localStorage.getItem('kleo_contributor_id');
    if (!contributorId) {
      contributorId = `anon_${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem('kleo_contributor_id', contributorId);
    }
    return contributorId;
  }
  return `anon_${crypto.randomUUID().slice(0, 8)}`;
}

export async function createKleoPost(submission: PostSubmission): Promise<KleoPost | null> {
  try {
    const {
      text,
      lat,
      lng,
      mediaFile,
      newsUrl,
      contributor_id,
      wallet,
      content_type
    } = submission;

    // Validate wallet
    if (!wallet || !wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    // Check rate limiting
    const rateLimitInfo = rateLimiterService.canPost(wallet.address);
    if (!rateLimitInfo.canPost) {
      throw new Error(`Rate limit exceeded. Please wait ${rateLimitInfo.timeRemaining} seconds before posting again.`);
    }

    // Determine media type and content
    let media_type: 'text' | 'video' | 'news' = 'text';
    let media_url: string | undefined;
    let source_url: string | undefined;
    let ai_summary: string | undefined;
    let credibility_score: number | undefined;
    let is_reliable: boolean | undefined;

    if (content_type === 'media' && mediaFile) {
      media_type = 'video'; // Only video for MVP
      media_url = await web3StorageService.uploadFile(mediaFile);
    } else if (content_type === 'news' && newsUrl) {
      media_type = 'news';
      source_url = newsUrl;

      // Fetch and analyze news content
      const newsContent = await newsFetcherService.fetchArticle(newsUrl);
      
      // Check credibility
      const credibilityAnalysis = await fakeNewsDetectorService.analyzeArticle(newsUrl, newsContent.content);
      credibility_score = credibilityAnalysis.score;
      is_reliable = credibilityAnalysis.isReliable;

      // Generate AI summary
      const summaryResult = await aiSummaryService.generateSummary({
        content: newsContent.content,
        title: newsContent.title,
        url: newsUrl,
        location: { lat, lng }
      });
      ai_summary = summaryResult.summary;
    }

    // Calculate reward points
    const rewardPoints = calculateRewardPoints({
      text,
      media_type,
      wallet_type: wallet.type,
      is_reliable: is_reliable || false
    });

    // Create post metadata
    const postMetadata = {
      text,
      lat,
      lng,
      media_type,
      media_url,
      source_url,
      ai_summary,
      credibility_score,
      is_reliable,
      contributor_id: contributor_id || generateContributorId(),
      wallet_address: wallet.address,
      wallet_type: wallet.type,
      reward_points: rewardPoints,
      created_at: new Date().toISOString()
    };

    // Upload to IPFS
    const post_cid = await web3StorageService.uploadPost(postMetadata);

    // Create KleoPost object
    const kleoPost: KleoPost = {
      id: crypto.randomUUID(),
      user_id: wallet.address,
      type: media_type,
      content: text,
      lat,
      lng,
      media_url,
      ipfs_url: post_cid,
      far_score: rewardPoints,
      engagement_score: 0,
      flags: 0,
      created_at: postMetadata.created_at,
      updated_at: postMetadata.created_at,
      contributor_id: postMetadata.contributor_id,
      wallet_type: wallet.type,
      reward_points: rewardPoints,
      post_cid,
      ai_summary,
      source_url,
      content_type: content_type === 'news' ? 'news' : 'media',
      credibility_score,
      is_reliable,
      processing_info: {
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    };

    // Update user XP
    addUserXP(wallet.address, rewardPoints);
    recordPostProof(wallet.address, post_cid);

    // Mint NFT automatically
    try {
      await xrplNFTService.mintFromPostCID(post_cid, wallet.address);
    } catch (error) {
      console.error('NFT minting failed:', error);
      // Don't fail the post creation if NFT minting fails
    }

    return kleoPost;
  } catch (error) {
    console.error('Error creating Kleo post:', error);
    throw error;
  }
} 