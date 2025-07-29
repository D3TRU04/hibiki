# Habiki Platform - Setup Guide

## 🎉 What's Been Built

The Habiki decentralized news platform has been successfully created with the following core components:

### ✅ Completed Features

1. **Interactive World Map**
   - Mapbox GL JS integration
   - Clickable region markers
   - Responsive design with controls
   - Dark mode support

2. **Core UI Components**
   - Header with brand, dark mode toggle, and wallet connection
   - Region panel with tabs for stories, news, and radio
   - Story cards with contributor badges and trust scores
   - Filter bar for content filtering
   - Submit modal for story submission

3. **Type System**
   - Comprehensive TypeScript types for all entities
   - Story, Contributor, Region, and API interfaces
   - Filter options and configuration types

4. **API Structure**
   - RESTful API routes for story submission
   - Mock data for development
   - Error handling and validation

5. **Configuration System**
   - Centralized config for all platform settings
   - Environment variable management
   - Feature flags and reward configuration

6. **Utility Functions**
   - Time formatting and validation
   - File handling and API calls
   - Trust scoring and content moderation

## 🚀 Next Steps for Production

### 1. Environment Setup

Create a `.env.local` file with your API keys:

```env
# Required for map functionality
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Database and authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# News integration
NEWS_API_KEY=your_news_api_key

# OpenAI (currently disabled)
# OPENAI_API_KEY=your_openai_api_key
```

### 2. Database Setup (Supabase)

Create the following tables in your Supabase database:

```sql
-- Contributors table
CREATE TABLE contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  trust_score INTEGER DEFAULT 50,
  region TEXT,
  story_count INTEGER DEFAULT 0,
  has_story_node_nft BOOLEAN DEFAULT FALSE,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  type TEXT NOT NULL,
  region TEXT NOT NULL,
  contributor_id UUID REFERENCES contributors(id),
  audio_url TEXT,
  radio_stream_url TEXT,
  news_source TEXT,
  trust_score INTEGER DEFAULT 50,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  tags TEXT[],
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Radio stations table
CREATE TABLE radio_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT,
  country TEXT,
  language TEXT,
  tags TEXT[],
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Blockchain Integration

#### XRPL Setup
1. Set up XRPL testnet/mainnet connection
2. Deploy RLUSD token contract
3. Deploy StoryNode NFT contract
4. Implement wallet connection

#### Smart Contracts
```solidity
// RLUSD Token Contract (XRPL EVM)
contract RLUSD {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    function transfer(address to, uint256 amount) public returns (bool);
    function approve(address spender, uint256 amount) public returns (bool);
    function transferFrom(address from, address to, uint256 amount) public returns (bool);
}

// StoryNode NFT Contract
contract StoryNodeNFT {
    struct StoryNode {
        uint256 tokenId;
        address contributor;
        string metadata;
        uint256 trustScore;
        uint256 storyCount;
    }
    
    function mint(address to, string memory metadata) public returns (uint256);
}
```

### 4. External API Integration

#### News API
```typescript
// src/services/newsApi.ts
export const fetchNewsByRegion = async (region: string) => {
  const response = await fetch(
    `${config.external.newsApi.baseUrl}/everything?q=${region}&apiKey=${config.external.newsApi.apiKey}`
  );
  return response.json();
};
```

#### Radio Browser API
```typescript
// src/services/radioApi.ts
export const fetchRadioStations = async (country: string) => {
  const response = await fetch(
    `${config.external.radioBrowser.baseUrl}/stations/bycountry/${country}`
  );
  return response.json();
};
```

### 5. AI Integration (Currently Disabled)

#### OpenAI Summarization
```typescript
// src/services/ai.ts
// Currently disabled - uncomment when ready to implement
export const summarizeStory = async (content: string) => {
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return response.json();
};
```

### 6. IPFS Integration

#### File Upload
```typescript
// src/services/ipfs.ts
export const uploadToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/ipfs/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

## 🧪 Testing

### Unit Tests
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### E2E Tests
```bash
npm install --save-dev playwright
```

## 📱 Mobile Optimization

1. Add responsive breakpoints
2. Implement touch gestures for map
3. Optimize for mobile performance
4. Add PWA capabilities

## 🔒 Security

1. Implement rate limiting
2. Add content moderation
3. Validate file uploads
4. Secure API endpoints
5. Add CORS configuration

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Analytics

1. Add Google Analytics
2. Track user interactions
3. Monitor performance
4. Set up error tracking

## 🔄 Continuous Integration

1. Set up GitHub Actions
2. Add automated testing
3. Configure deployment pipeline
4. Add code quality checks

## 📈 Performance Optimization

1. Implement lazy loading
2. Add image optimization
3. Use React.memo for components
4. Implement virtual scrolling for large lists

## 🎨 Design Enhancements

1. Add animations and transitions
2. Implement skeleton loading states
3. Add micro-interactions
4. Improve accessibility

## 🔮 Advanced Features

1. Real-time updates with WebSockets
2. Offline support with service workers
3. Push notifications
4. Advanced search and filtering
5. Social features (sharing, commenting)
6. Multi-language support
7. Advanced analytics dashboard

## 📞 Support

For questions or issues:
- Create GitHub issues
- Check the documentation
- Join community discussions

---

**Habiki** - Building the future of decentralized news 🌍✨ 