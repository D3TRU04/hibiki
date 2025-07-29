# Habiki - Decentralized News Platform

A censorship-resistant decentralized platform that displays a world map where users can explore real-time local news, radio streams, and user-submitted stories. Contributors earn RLUSD rewards and StoryNode NFTs for sharing trusted, on-the-ground content.

## 🌍 Features

- **Interactive World Map**: Explore news and stories by region with Mapbox GL JS
- **Real-time Content**: Live news, radio streams, and user-submitted stories
- **Blockchain Rewards**: RLUSD token rewards and StoryNode NFTs for contributors
- **Trust System**: Reputation scoring and verification for quality content
- **Multi-language Support**: Global content in multiple languages
- **Dark Mode**: Beautiful light and dark themes
- **Mobile Responsive**: Optimized for all devices

## 🚀 Tech Stack

- **Framework**: Next.js 15 with TypeScript and React
- **Styling**: TailwindCSS with custom dark mode
- **Map Library**: Mapbox GL JS for interactive world map
- **State Management**: React Hooks for local state
- **Storage**: Supabase (Postgres) + IPFS for decentralized media
- **Payments**: RLUSD on XRPL EVM sidechain
- **Blockchain**: XRPL mainnet for identities, XRPL EVM for NFTs
- **UI Components**: Lucide React icons, custom components

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habiki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Mapbox (Required for map functionality)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   
   # Supabase (For database)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # News API (For news integration)
   NEWS_API_KEY=your_news_api_key
   
   # OpenAI (For AI summarization - currently disabled)
   # OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗺️ Mapbox Setup

1. Create a Mapbox account at [mapbox.com](https://mapbox.com)
2. Generate an access token
3. Add the token to your `.env.local` file
4. The map will automatically load with interactive markers

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and dark mode
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Header.tsx         # Navigation and controls
│   ├── Map.tsx           # Interactive world map
│   ├── RegionPanel.tsx   # Region content display
│   ├── StoryCard.tsx     # Individual story component
│   ├── ContributorBadge.tsx # Contributor info
│   ├── FilterBar.tsx     # Content filtering
│   └── SubmitModal.tsx   # Story submission form
└── types/                # TypeScript type definitions
    └── index.ts          # All platform types
```

## 🎯 Core Components

### Map Component
- Interactive world map with Mapbox GL JS
- Clickable region markers
- Real-time data overlays
- Responsive design with controls

### Region Panel
- Displays news, radio, and stories for selected regions
- Tabbed interface for different content types
- Filtering and sorting options
- Real-time updates

### Story Submission
- Multi-type story submission (text, audio, radio)
- Region selection
- File upload for audio reports
- Tagging and categorization
- Reward information display

### Contributor System
- Trust scoring and reputation
- StoryNode NFT integration
- RLUSD reward tracking
- Verification badges

## 🔧 Development

### Adding New Regions
Edit the `mockRegions` array in `src/components/Map.tsx`:
```typescript
const mockRegions: Region[] = [
  {
    id: 'your-region',
    name: 'Your Region',
    country: 'Your Country',
    countryCode: 'YC',
    coordinates: [longitude, latitude],
    population: 1000000,
    timezone: 'Your/Timezone'
  }
];
```

### Customizing Styles
- Modify `src/app/globals.css` for global styles
- Use TailwindCSS classes for component styling
- Dark mode is automatically handled

### Adding New Content Types
1. Update the `Story` type in `src/types/index.ts`
2. Add new type to the submission form in `SubmitModal.tsx`
3. Update the story card display logic in `StoryCard.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Configure your hosting provider

## 🔗 API Integrations

### News API
- Fetch region-specific headlines
- Real-time news updates
- Source verification

### Radio Browser API
- Live radio streams by country/language
- Station metadata and favicons
- Stream quality indicators

### Supabase Database
- User stories and content
- Contributor profiles
- Trust scores and reputation

### OpenAI Integration
- Automatic story summarization
- Content quality assessment
- Multi-language support

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Typography
- Headings: Inter font family
- Body: System font stack
- Monospace: For code and technical content

### Components
- Rounded corners (8px default)
- Subtle shadows and borders
- Smooth transitions (0.2s)
- Hover states for all interactive elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Features

- [ ] Dynamic StoryNode NFT metadata
- [ ] AI-powered content moderation
- [ ] Translation layer for multilingual regions
- [ ] Bounty system for specific region requests
- [ ] Advanced wallet integration
- [ ] Spam filtering with World ID
- [ ] Mobile app development
- [ ] Offline support with service workers

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Join our community discussions
- Check the documentation

---

**Habiki** - Connecting the world through decentralized storytelling 🌍✨
