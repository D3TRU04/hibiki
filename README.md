# Kleo MVP - Censorship-Resistant Map App

Kleo is a decentralized storytelling platform that allows users to share stories, memories, and experiences tied to specific locations on a 3D interactive globe. Built with Next.js, Mapbox, IPFS, and XRPL for true decentralization.

## Features

- 🌍 **3D Interactive Globe**: Full-screen Mapbox globe with terrain and buildings
- 🔐 **Decentralized Auth**: IPFS-based user authentication with local storage
- 📍 **Location-Based Stories**: Click anywhere on the map to share stories
- 🎵 **Media Support**: Upload audio or video files to IPFS
- 🛡️ **Anti-Spam**: Rate limiting (10 minutes between posts) and honeypot protection
- 🏆 **Farcaster-Style Rewards**: Reputation scoring and contribution points system
- 💰 **XRPL Integration**: Earn XRP rewards for contributions
- 🎨 **Beautiful UI**: Clean white and gold theme with modern design
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Map**: Mapbox GL JS 3.14
- **Storage**: IPFS via NFT.Storage (completely decentralized)
- **Blockchain**: XRPL for rewards and wallet integration
- **Authentication**: IPFS-based with local storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox account
- NFT.Storage account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kleo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Mapbox
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   
   # IPFS (NFT.Storage)
   NEXT_PUBLIC_NFT_STORAGE_TOKEN=your_nft_storage_token
   
   # XRPL Network (optional, defaults to testnet)
   NEXT_PUBLIC_XRPL_NETWORK=testnet
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Your Mapbox access token | Yes |
| `NEXT_PUBLIC_NFT_STORAGE_TOKEN` | Your NFT.Storage API token | Yes |
| `NEXT_PUBLIC_XRPL_NETWORK` | XRPL network (testnet/mainnet) | No |

## Architecture

### Decentralized Storage
- **IPFS**: All data stored on IPFS via NFT.Storage
- **Global State**: Centralized index of users and posts on IPFS
- **User Profiles**: Individual user data stored as IPFS objects
- **Posts**: Each post stored as separate IPFS object with metadata

### Reward System (Farcaster-inspired)
- **Far Score**: Reputation score based on activity and engagement
- **Contribution Points**: Earned for creating content (text: 10, audio: 25, video: 50)
- **Reputation Tiers**: Bronze, Silver, Gold, Platinum, Diamond
- **Engagement Multiplier**: Higher reputation = more points per action

### XRPL Integration
- **Wallet Generation**: Create new XRPL wallets in-app
- **Reward Distribution**: Earn XRP for contributions (1 XRP per 100 points)
- **Faucet Support**: Get testnet funds for development
- **Balance Tracking**: Real-time XRP balance display

## Data Structure

### User Profile (IPFS)
```typescript
{
  id: string;
  email?: string;
  wallet_address?: string;
  xrpl_address?: string;
  far_score: number;
  contribution_points: number;
  created_at: string;
  updated_at: string;
  ipfs_profile_url?: string;
}
```

### Post (IPFS)
```typescript
{
  id: string;
  user_id: string;
  type: 'text' | 'audio' | 'video';
  content: string;
  lat: number;
  lng: number;
  media_url?: string;
  ipfs_metadata_url?: string;
  ipfs_post_url?: string;
  far_score: number;
  engagement_score: number;
  flags: number;
  created_at: string;
  updated_at: string;
  user?: User;
}
```

### Reward System
```typescript
{
  far_score: number;
  contribution_points: number;
  engagement_multiplier: number;
  reputation_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xrpl_rewards_enabled: boolean;
  xrpl_address?: string;
  pending_rewards: number;
  posts_created: number;
  posts_liked: number;
  posts_shared: number;
  days_active: number;
}
```

## Features in Detail

### Authentication
- IPFS-based user profiles
- Local storage session management
- No centralized database required
- Email-based authentication (optional password)

### Map Features
- 3D globe with terrain and buildings
- Click to place stories
- Interactive markers with popups
- Global view by default

### Story Creation
- Text, audio, or video posts
- Location auto-fill from map click
- IPFS upload for media and metadata
- Anti-spam protection (honeypot + rate limiting)

### Reward System
- **Farcaster-style scoring**: Far score based on activity
- **Contribution points**: Earn points for creating content
- **Reputation tiers**: Bronze to Diamond based on far score
- **XRPL rewards**: Convert points to XRP
- **Engagement tracking**: Activity metrics and multipliers

### Anti-Spam Measures
- **Rate Limiting**: Users can only post once every 10 minutes
- **Honeypot**: Hidden form field to catch bots
- **Content Validation**: Server-side validation
- **Reputation-based**: Higher reputation users get more privileges

## Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── Map/            # Main map page
│   └── page.tsx        # Redirect to /Map
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication & wallet modal
│   ├── LoadingPage.tsx # Loading screen
│   ├── MapContainer.tsx # Mapbox integration
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API
│   ├── api.ts          # IPFS API functions
│   ├── auth.ts         # Authentication service
│   ├── ipfs-storage.ts # IPFS storage system
│   ├── xrpl-wallet.ts  # XRPL wallet integration
│   └── types.ts        # TypeScript types
└── styles/             # Global styles
```

### Key Components

- **MapContainer**: Handles Mapbox 3D globe rendering
- **AuthModal**: User authentication, wallet management, and rewards
- **UploadModal**: Story creation with media upload
- **LoadingPage**: Beautiful loading screen with Kleo branding

### API Functions

- `createUser()`: Create new IPFS user profile
- `createPost()`: Create new story with IPFS upload
- `getPosts()`: Fetch all stories from IPFS
- `getRewardSystem()`: Get user's reward status
- `generateWallet()`: Create new XRPL wallet
- `claimRewards()`: Convert points to XRP

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure all environment variables are set
- Build command: `npm run build`
- Start command: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Kleo** - Share Your Stories with the World 🌍✨
