# Kleo - Share Your Stories

A modern web application for sharing stories and memories on an interactive map. Built with Next.js, Mapbox, and Supabase.

## Features

- 🗺️ **Interactive Map** - Full-screen Mapbox map with click-to-add functionality
- 📝 **Story Sharing** - Share text stories and audio recordings
- 🎨 **Modern UI** - Glassmorphism design with beautiful animations
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🎵 **Audio Support** - Upload and play audio recordings
- ⚡ **Real-time** - Instant updates when stories are added

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Map**: Mapbox GL JS
- **Backend**: Supabase (Database + Storage)
- **Icons**: Lucide React

## Quick Start

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
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Create a `posts` table with the following schema:
   ```sql
   CREATE TABLE posts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     text TEXT NOT NULL,
     lat DOUBLE PRECISION NOT NULL,
     lng DOUBLE PRECISION NOT NULL,
     media_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
   - Create a storage bucket called `kleo-audio`
   - Set up Row Level Security (RLS) policies for public read/insert access

5. **Set up Mapbox**
   - Create a Mapbox account
   - Get your access token
   - Add it to your `.env.local` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/          # Reusable components
│   ├── GlassyNavbar.tsx
│   ├── MapContainer.tsx
│   ├── UploadModal.tsx
│   └── UploadForm.tsx
├── hooks/              # Custom React hooks
│   ├── useMap.ts
│   └── useUploadModal.ts
└── lib/                # Utilities and configurations
    ├── api.ts          # Supabase API functions
    ├── supabase.ts     # Supabase client
    └── types.ts        # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token for maps | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
