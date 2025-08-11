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
  private subgraphUrl: string;

  constructor() {
    this.subgraphUrl = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.thegraph.com/subgraphs/name/your-subgraph';
  }

  static getInstance(): GraphClient {
    if (!GraphClient.instance) {
      GraphClient.instance = new GraphClient();
    }
    return GraphClient.instance;
  }

  // Query all posts with pagination
  async getPosts(first: number = 10, skip: number = 0): Promise<GraphQLPost[]> {
    try {
      const response = await this.executeQuery(`
        query GetPosts($first: Int!, $skip: Int!) {
          posts(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            content
            mediaType
            ipfsHash
            createdAt
            user {
              id
              wallet
            }
          }
        }
      `, { first, skip });

      return response?.posts || [];
    } catch (error) {
      return [];
    }
  }

  // Query posts by media type
  async getPostsByMediaType(mediaType: string, first: number = 10): Promise<GraphQLPost[]> {
    try {
      const response = await this.executeQuery(`
        query GetPostsByMediaType($mediaType: String!, $first: Int!) {
          posts(where: { mediaType: $mediaType }, first: $first, orderBy: createdAt, orderDirection: desc) {
            id
            content
            mediaType
            ipfsHash
            createdAt
            user {
              id
              wallet
            }
          }
        }
      `, { mediaType, first });

      return response?.posts || [];
    } catch (error) {
      return [];
    }
  }

  // Query posts by wallet address
  async getPostsByWallet(wallet: string, first: number = 10): Promise<GraphQLPost[]> {
    try {
      const response = await this.executeQuery(`
        query GetPostsByWallet($wallet: String!) {
          posts(where: { user: $wallet }, first: $first, orderBy: createdAt, orderDirection: desc) {
            id
            content
            mediaType
            ipfsHash
            createdAt
            user {
              id
              wallet
            }
          }
        }
      `, { wallet, first });

      return response?.posts || [];
    } catch (error) {
      return [];
    }
  }

  // Query NFTs by wallet
  async getNFTsByWallet(wallet: string, first: number = 10): Promise<GraphQLNFT[]> {
    try {
      const response = await this.executeQuery(`
        query GetNFTsByWallet($wallet: String!) {
          nfts(where: { owner: $wallet }, first: $first, orderBy: createdAt, orderDirection: desc) {
            id
            tokenId
            post {
              id
              content
              ipfsHash
            }
            owner
            createdAt
          }
        }
      `, { wallet, first });

      return response?.nfts || [];
    } catch (error) {
      return [];
    }
  }

  // Query rewards by wallet
  async getRewardsByWallet(wallet: string, first: number = 10): Promise<GraphQLReward[]> {
    try {
      const response = await this.executeQuery(`
        query GetRewardsByWallet($wallet: String!) {
          rewards(where: { user: $wallet }, first: $first, orderBy: createdAt, orderDirection: desc) {
            id
            amount
            reason
            createdAt
            user {
              id
              wallet
            }
          }
        }
      `, { wallet, first });

      return response?.rewards || [];
    } catch (error) {
      return [];
    }
  }

  // Query user profile
  async getUserProfile(wallet: string): Promise<GraphQLUser | null> {
    try {
      const response = await this.executeQuery(`
        query GetUserProfile($wallet: String!) {
          user(id: $wallet) {
            id
            wallet
            contributionPoints
            totalPosts
            totalRewards
            createdAt
          }
        }
      `, { wallet });

      return response?.user || null;
    } catch (error) {
      return null;
    }
  }

  // Query global stats
  async getGlobalStats(): Promise<GraphQLGlobalStats | null> {
    try {
      const response = await this.executeQuery(`
        query GetGlobalStats {
          global(id: "global") {
            total_posts
            total_users
            total_rewards
            total_nfts
          }
        }
      `);

      return response?.global || {
        id: 'global',
        total_posts: 0,
        unique_users: 0,
        total_rewards_claimed: 0,
        total_nfts: 0,
        total_xp_distributed: 0,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      return {
        id: 'global',
        total_posts: 0,
        unique_users: 0,
        total_rewards_claimed: 0,
        total_nfts: 0,
        total_xp_distributed: 0,
        last_updated: new Date().toISOString()
      };
    }
  }

  // Search posts by summary text (if supported)
  async searchPosts(query: string, first: number = 10): Promise<GraphQLPost[]> {
    try {
      const response = await this.executeQuery(`
        query SearchPosts($query: String!, $first: Int!) {
          posts(where: { content_contains_nocase: $query }, first: $first, orderBy: createdAt, orderDirection: desc) {
            id
            content
            mediaType
            ipfsHash
            createdAt
            user {
              id
              wallet
            }
          }
        }
      `, { query, first });

      return response?.posts || [];
    } catch (error) {
      return [];
    }
  }

  // Get leaderboard by XP
  async getLeaderboard(first: number = 10): Promise<GraphQLUser[]> {
    try {
      const response = await this.executeQuery(`
        query GetLeaderboard($first: Int!) {
          users(first: $first, orderBy: contributionPoints, orderDirection: desc) {
            id
            wallet
            contributionPoints
            totalPosts
            totalRewards
            createdAt
          }
        }
      `, { first });

      return response?.users || [];
    } catch (error) {
      return [];
    }
  }

  private async executeQuery(query: string, variables: Record<string, any> = {}): Promise<any> {
    try {
      const response = await fetch(this.subgraphUrl, {
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
        return null;
      }

      const data = await response.json();

      if (data.errors || !data.data) {
        return null;
      }

      return data.data;
    } catch (e) {
      return null;
    }
  }
}

// Export singleton instance
export const graphClient = GraphClient.getInstance(); 