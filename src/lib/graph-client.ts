// GraphQL queries for Kleo subgraph
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT || 'https://api.studio.thegraph.com/query/kleo-subgraph';

export interface GraphQLPost {
  id: string;
  post_cid: string;
  wallet: string;
  timestamp: string;
  media_type: string;
  source_url?: string;
  summary_text?: string;
  reward_points: number;
  lat: number;
  lng: number;
  is_reliable: boolean;
  credibility_score: number;
  contributor_id: string;
}

export interface GraphQLNFT {
  id: string;
  token_id: string;
  post_cid: string;
  wallet: string;
  timestamp: string;
  transaction_hash: string;
  metadata: string;
}

export interface GraphQLReward {
  id: string;
  wallet: string;
  amount: string;
  total_xp: number;
  timestamp: string;
  transaction_hash: string;
}

export interface GraphQLUser {
  id: string;
  wallet: string;
  total_xp: number;
  total_posts: number;
  total_nfts: number;
  total_rewards_claimed: number;
  last_activity: string;
}

export interface GraphQLGlobalStats {
  id: string;
  total_posts: number;
  total_nfts: number;
  total_rewards_claimed: number;
  total_xp_distributed: number;
  unique_users: number;
  last_updated: string;
}

export class GraphClient {
  private static instance: GraphClient;

  static getInstance(): GraphClient {
    if (!GraphClient.instance) {
      GraphClient.instance = new GraphClient();
    }
    return GraphClient.instance;
  }

  // Query all posts with pagination
  async getPosts(first: number = 10, skip: number = 0): Promise<GraphQLPost[]> {
    const query = `
      query GetPosts($first: Int!, $skip: Int!) {
        postSubmitteds(
          first: $first
          skip: $skip
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          post_cid
          wallet
          timestamp
          media_type
          source_url
          summary_text
          reward_points
          lat
          lng
          is_reliable
          credibility_score
          contributor_id
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { first, skip });
      const items = (response.data as unknown as { postSubmitteds?: GraphQLPost[] }).postSubmitteds;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching posts from subgraph:', error);
      return [];
    }
  }

  // Query posts by media type
  async getPostsByMediaType(mediaType: string, first: number = 10): Promise<GraphQLPost[]> {
    const query = `
      query GetPostsByMediaType($mediaType: String!, $first: Int!) {
        postSubmitteds(
          where: { media_type: $mediaType }
          first: $first
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          post_cid
          wallet
          timestamp
          media_type
          source_url
          summary_text
          reward_points
          lat
          lng
          is_reliable
          credibility_score
          contributor_id
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { mediaType, first });
      const items = (response.data as unknown as { postSubmitteds?: GraphQLPost[] }).postSubmitteds;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching posts by media type:', error);
      return [];
    }
  }

  // Query posts by wallet address
  async getPostsByWallet(wallet: string): Promise<GraphQLPost[]> {
    const query = `
      query GetPostsByWallet($wallet: String!) {
        postSubmitteds(
          where: { wallet: $wallet }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          post_cid
          wallet
          timestamp
          media_type
          source_url
          summary_text
          reward_points
          lat
          lng
          is_reliable
          credibility_score
          contributor_id
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { wallet });
      const items = (response.data as unknown as { postSubmitteds?: GraphQLPost[] }).postSubmitteds;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching posts by wallet:', error);
      return [];
    }
  }

  // Query NFTs by wallet
  async getNFTsByWallet(wallet: string): Promise<GraphQLNFT[]> {
    const query = `
      query GetNFTsByWallet($wallet: String!) {
        nftMinteds(
          where: { wallet: $wallet }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          token_id
          post_cid
          wallet
          timestamp
          transaction_hash
          metadata
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { wallet });
      const items = (response.data as unknown as { nftMinteds?: GraphQLNFT[] }).nftMinteds;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching NFTs by wallet:', error);
      return [];
    }
  }

  // Query rewards by wallet
  async getRewardsByWallet(wallet: string): Promise<GraphQLReward[]> {
    const query = `
      query GetRewardsByWallet($wallet: String!) {
        rewardClaimeds(
          where: { wallet: $wallet }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          wallet
          amount
          total_xp
          timestamp
          transaction_hash
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { wallet });
      const items = (response.data as unknown as { rewardClaimeds?: GraphQLReward[] }).rewardClaimeds;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching rewards by wallet:', error);
      return [];
    }
  }

  // Query user profile
  async getUserProfile(wallet: string): Promise<GraphQLUser | null> {
    const query = `
      query GetUserProfile($wallet: String!) {
        user(id: $wallet) {
          id
          wallet
          total_xp
          total_posts
          total_nfts
          total_rewards_claimed
          last_activity
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { wallet });
      const item = (response.data as unknown as { user?: GraphQLUser }).user;
      return (item ?? null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Query global stats
  async getGlobalStats(): Promise<GraphQLGlobalStats | null> {
    const query = `
      query GetGlobalStats {
        globalStats(id: "kleo-global-stats") {
          id
          total_posts
          total_nfts
          total_rewards_claimed
          total_xp_distributed
          unique_users
          last_updated
        }
      }
    `;

    try {
      const response = await this.executeQuery(query);
      const item = (response.data as unknown as { globalStats?: GraphQLGlobalStats }).globalStats;
      return (item ?? null);
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return null;
    }
  }

  // Search posts by summary text (if supported)
  async searchPosts(searchTerm: string, first: number = 10): Promise<GraphQLPost[]> {
    const query = `
      query SearchPosts($searchTerm: String!, $first: Int!) {
        postSearchs(
          where: { summary_text_contains: $searchTerm }
          first: $first
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          post_cid
          wallet
          timestamp
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { searchTerm, first });
      const items = (response.data as unknown as { postSearchs?: GraphQLPost[] }).postSearchs;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Get leaderboard by XP
  async getLeaderboard(first: number = 10): Promise<GraphQLUser[]> {
    const query = `
      query GetLeaderboard($first: Int!) {
        users(
          first: $first
          orderBy: total_xp
          orderDirection: desc
        ) {
          id
          wallet
          total_xp
          total_posts
          total_nfts
          total_rewards_claimed
          last_activity
        }
      }
    `;

    try {
      const response = await this.executeQuery(query, { first });
      const items = (response.data as unknown as { users?: GraphQLUser[] }).users;
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  private async executeQuery(query: string, variables: Record<string, unknown> = {}): Promise<{ data: { users?: unknown[]; [k: string]: unknown }; errors?: unknown }> {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data: { data: { [k: string]: unknown }; errors?: unknown } = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data as { data: { users?: unknown[]; [k: string]: unknown }; errors?: unknown };
  }
}

// Export singleton instance
export const graphClient = GraphClient.getInstance(); 