export const config = {
  // Platform settings
  platform: {
    name: 'Habiki',
    description: 'Decentralized News Platform',
    version: '0.1.0',
    supportEmail: 'support@habiki.com'
  },

  // Map configuration
  map: {
    defaultCenter: [0, 20] as [number, number],
    defaultZoom: 2,
    style: 'mapbox://styles/mapbox/light-v11',
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  },

  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    stories: '/api/stories',
    news: '/api/news',
    radio: '/api/radio',
    contributors: '/api/contributors'
  },

  // External APIs
  external: {
    newsApi: {
      baseUrl: 'https://newsapi.org/v2',
      apiKey: process.env.NEWS_API_KEY
    },
    radioBrowser: {
      baseUrl: 'https://de1.api.radio-browser.info/json'
    },
    // OpenAI configuration - commented out for now
    // openai: {
    //   apiKey: process.env.OPENAI_API_KEY,
    //   model: 'gpt-4o-mini'
    // }
  },

  // Blockchain configuration
  blockchain: {
    xrpl: {
      network: process.env.XRPL_NETWORK || 'testnet',
      mainnetUrl: 'wss://xrplcluster.com',
      testnetUrl: 'wss://s.altnet.rippletest.net:51233'
    },
    evm: {
      network: process.env.XRPL_EVM_NETWORK || 'testnet',
      rpcUrl: process.env.XRPL_EVM_RPC_URL
    },
    rlusd: {
      contractAddress: process.env.RLUSD_CONTRACT_ADDRESS,
      decimals: 6
    },
    nft: {
      contractAddress: process.env.STORYNODE_NFT_CONTRACT_ADDRESS,
      baseUri: process.env.NFT_BASE_URI
    }
  },

  // Storage configuration
  storage: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    ipfs: {
      gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
      apiKey: process.env.IPFS_API_KEY
    }
  },

  // Feature flags
  features: {
    aiSummarization: false, // Disabled for now
    audioUpload: true,
    radioStreams: true,
    nftRewards: true,
    rlusdRewards: true,
    darkMode: true,
    multiLanguage: true
  },

  // Reward configuration
  rewards: {
    storySubmission: {
      base: 2, // RLUSD
      bonus: {
        audio: 1,
        breaking: 2,
        verified: 1
      }
    },
    nft: {
      minStories: 10,
      minTrustScore: 70
    }
  },

  // Trust scoring
  trust: {
    levels: {
      verified: 90,
      trusted: 70,
      established: 50,
      new: 0
    },
    factors: {
      storyQuality: 0.4,
      communityFeedback: 0.3,
      consistency: 0.2,
      verification: 0.1
    }
  },

  // Content moderation
  moderation: {
    minStoryLength: 50,
    maxStoryLength: 5000,
    maxAudioDuration: 300, // 5 minutes
    spamThreshold: 5, // stories per hour
    requiredFields: ['title', 'content', 'region', 'type']
  }
};

export default config; 