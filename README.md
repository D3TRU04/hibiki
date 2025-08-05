# Kleo - Sprint 1: Mapbox + Supabase Integration

A decentralized platform for sharing local stories and experiences through an interactive map interface.

## 🚀 Sprint 1 Features

- **Full-screen Mapbox Map**: Interactive map with pin drop functionality
- **Story Submission**: Upload text stories and optional audio recordings
- **Supabase Integration**: Store posts and media files in the cloud
- **Real-time Updates**: See stories appear on the map instantly
- **Audio Playback**: Listen to audio recordings directly from map pins
- **Loading Screen**: Beautiful loading animation while the map initializes
- **Navigation Bar**: Professional navbar with mobile-responsive design

## 🏗️ Project Structure

```
kleo/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js app router
│   │   └── pages/    # Page-first architecture
│   │       └── Map/  # Map page with components and hooks
│   │           ├── components/
│   │           │   ├── LoadingScreen.tsx    # Loading animation
│   │           │   ├── NavBar.tsx           # Navigation bar
│   │           │   ├── MapContainer.tsx     # Map wrapper
│   │           │   ├── MapControls.tsx      # Map controls
│   │           │   ├── PinMarker.tsx        # Map pins
│   │           │   ├── UploadModal.tsx      # Story upload modal
│   │           │   ├── UploadForm.tsx       # Upload form
│   │           │   └── AudioPlayer.tsx      # Audio playback
│   │           └── hooks/
│   │               ├── useMap.ts            # Map logic
│   │               └── useUploadModal.ts    # Upload modal logic
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Backend services (MVC pattern)
│   ├── config/       # Configuration files
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   ├── controllers/  # Request handlers
│   ├── routes/       # API route exports
│   └── package.json  # Backend dependencies
└── scripts.sh        # Project management script
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Mapbox account and access token
- Supabase project

### 1. Environment Setup

Create environment files for both frontend and backend:

**Frontend Environment** (`frontend/.env.local`):
```bash
# Mapbox Configuration
# Get your access token from: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Supabase Configuration (Client-side)
# Get these from your Supabase project dashboard: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Backend Environment** (`backend/.env`):
```bash
# Supabase Configuration (Server-side)
# Get these from your Supabase project dashboard: https://supabase.com/dashboard
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Mapbox Setup

1. Create a Mapbox account at [mapbox.com](https://mapbox.com)
2. Generate an access token in your account dashboard
3. Add the token to your `frontend/.env.local` file

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from the API settings
3. Create a storage bucket named `kleo-audio` for audio files
4. Create the `posts` table with the following SQL:

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON posts
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON posts
  FOR INSERT WITH CHECK (true);
```

5. Set up storage policies for the `kleo-audio` bucket:

```sql
-- Allow public read access to audio files
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'kleo-audio');

-- Allow public upload access to audio files
CREATE POLICY "Allow public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kleo-audio');
```

### 4. Install Dependencies

```bash
# Using the project script
./scripts.sh install

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run the Development Server

```bash
# Using the project script
./scripts.sh dev

# Or run directly
cd frontend && npm run dev
```

### 6. Available Scripts

```bash
./scripts.sh install      # Install dependencies for both projects
./scripts.sh dev          # Start development server
./scripts.sh build        # Build frontend for production
./scripts.sh start        # Start production server
./scripts.sh lint         # Run linter
./scripts.sh type-check   # Run TypeScript type checking
./scripts.sh clean        # Clean and reinstall all dependencies
```

## 🧪 Testing the Application

1. Start the development server: `./scripts.sh dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. You'll see a beautiful loading screen while the map initializes
4. Once loaded, you'll see the navigation bar at the top
5. Click anywhere on the map to drop a pin
6. Fill out the story form and optionally upload an audio file
7. Submit to see your story appear on the map
8. Click on pins to view stories and play audio

## 🎨 UI Features

### Loading Screen
- Beautiful gradient background with Kleo branding
- Animated loading dots
- Smooth transition to the main interface

### Navigation Bar
- Professional design with Kleo branding
- Mobile-responsive with hamburger menu
- Shows story and user statistics
- Clean backdrop blur effect

### Map Interface
- Full-screen interactive map
- Floating controls positioned below navbar
- Pin markers with hover effects
- Modal forms for story submission

## 📁 File Organization

### Frontend (Page-First Architecture)
- Each page has its own folder with components and hooks
- Components are kept under 200 lines
- Logic is extracted into custom hooks
- Shared components can be moved to a common directory

### Backend (MVC Pattern)
- **Models**: TypeScript interfaces and data structures
- **Services**: Direct database and storage interactions
- **Controllers**: Business logic and request orchestration
- **Routes**: API endpoint exports
- **Config**: Configuration files and client setup

## 🔧 Development

- **Type Safety**: Full TypeScript support with strict checking
- **Code Quality**: ESLint and Prettier for consistent code style
- **Architecture**: Clean separation between frontend and backend
- **Scalability**: Modular design allows easy feature additions
- **Responsive Design**: Mobile-first approach with responsive components

## 🚀 Deployment

The frontend can be deployed to Vercel, Netlify, or any static hosting service. The backend services are designed to work with Supabase's serverless functions or can be deployed as a separate API service.

## 📝 License

MIT License - see LICENSE file for details.
