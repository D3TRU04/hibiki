# Kleo

A map-based storytelling app built with Next.js, Mapbox GL, and IPFS (Pinata). Users can connect a wallet, post geo-anchored stories, and view a global feed.

## Overview
- Next.js App Router
- Mapbox GL for the globe
- Dynamic for wallet auth (EVM)
- IPFS via Pinata for storage
- Optional subgraph for analytics (fallback to Pinata metadata when unavailable)

## Quick Start
1) Install
```bash
npm install
```

2) Environment
Create `.env.local` in the project root:
```env
# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Dynamic (wallet auth)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id

# Pinata (server-side, do not expose publicly)
PINATA_JWT=your_pinata_jwt

# Optional: Subgraph for profile analytics
NEXT_PUBLIC_GRAPH_ENDPOINT=https://your-subgraph-endpoint

# Optional: EVM network info for MetaMask network add/switch
NEXT_PUBLIC_EVM_CHAIN_ID=1449000
NEXT_PUBLIC_EVM_CHAIN_NAME=XRPL EVM Sidechain Testnet
NEXT_PUBLIC_EVM_RPC_URL=https://rpc.testnet.xrplevm.org/
NEXT_PUBLIC_EVM_CURRENCY=XRP
NEXT_PUBLIC_EVM_BLOCK_EXPLORER_URL=https://explorer.testnet.xrplevm.org/
```

3) Run
```bash
npm run dev
```
Open http://localhost:3000 and navigate to /map.

## Build & Deploy
- Build: `npm run build`
- Start: `npm run start`
- Vercel: connect repo, add the environment variables above, and deploy

Server routes used in production:
- `POST /api/pinata/upload` – relay uploads to Pinata (files and JSON)
- `GET  /api/pinata/list`   – list pinned CIDs for metadata sync

## Key Paths
- `src/app/map/` – map view and components
- `src/components/` – UI components (navbar, auth modal)
- `src/hooks/` – state hooks (map, wallet)
- `src/lib/` – storage, auth, types, API helpers

## Data Flow
- Submissions are uploaded to IPFS via Pinata on the server route
- Client fetches posts via the IPFS storage service
- Profile page tries the subgraph first; if empty, it falls back to Pinata metadata

## Notes
- Keep PINATA_JWT only on the server (Vercel project env).
- Only one Dynamic provider is mounted in `src/app/layout.tsx`.
- Mapbox token must be set or the map will not render.

## License
MIT
