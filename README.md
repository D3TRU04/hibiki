# Kleo

A map‑based storytelling app built with Next.js (App Router), Mapbox GL, and IPFS. Users connect a wallet, submit geo‑anchored stories (video or news), and view a global feed.

## Stack
- Next.js 15 App Router
- Mapbox GL JS
- Wallet via Dynamic (EVM)
- Storage via IPFS (Pinata or web3.storage depending on configuration)
- Optional subgraph on The Graph for analytics

## Requirements
- Node.js 18+
- Mapbox token
- Pinata JWT (or web3.storage token if you wire that in)
- Dynamic environment ID
- Optional: Ripple EVM RPC, deployer private key (for EVM rewards), XRPL seed (for XRPL rewards)

## Environment
Create `.env` at the project root and add the following as needed:

```env
# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Dynamic (wallet auth)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id

# Pinata (server-side)
PINATA_JWT=your_pinata_jwt

# Subgraph (optional)
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<id>/<version>

# Ripple EVM sidechain (optional rewards on EVM)
RIPPLE_EVM_RPC_URL=https://rpc.testnet.xrplevm.org/
EVM_DEPLOYER_PRIVATE_KEY=0x...
NEXT_PUBLIC_EVM_CHAIN_ID=1449000
NEXT_PUBLIC_EVM_CHAIN_NAME=XRPL EVM Sidechain Testnet
NEXT_PUBLIC_EVM_RPC_URL=https://rpc.testnet.xrplevm.org/
NEXT_PUBLIC_EVM_CURRENCY=XRP
NEXT_PUBLIC_EVM_BLOCK_EXPLORER_URL=https://explorer.testnet.xrplevm.org/

# EVM reward sizing (optional; safe defaults)
EVM_WEI_PER_POINT=10000000000000000        # 0.01 XRP
EVM_MAX_WEI_PER_TX=1000000000000000000     # 1 XRP
EVM_MIN_WEI=100000000000000                # 0.0001 XRP

# XRPL L1 (optional rewards on XRP L1)
XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233
XRPL_WALLET_SEED=sn...
XRPL_DROPS_PER_POINT=10000                 # 0.01 XRP
XRPL_MAX_DROPS_PER_TX=1000000              # 1 XRP
XRPL_MIN_DROPS=1000                        # 0.001 XRP
```

Notes:
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep secrets server‑side.
- If you disable EVM or XRPL rewards, the app still functions (posting, map, feed).

## Local Development
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Production Build
```bash
npm run build
npm run start
```

## Vercel Deployment
- Connect the repository
- Set environment variables in the Vercel Project Settings (including server‑side secrets)
- Deploy

## Server Routes (prod)
- POST `/api/pinata/upload` – relays uploads to Pinata
- GET  `/api/pinata/list` – lists pinned CIDs for sync
- POST `/api/rewards/claim` – XRPL Testnet reward (if configured)
- POST `/api/rewards/claim-evm` – EVM Sidechain reward (if configured)

## Key Paths
- `src/app/map/` – map view and UI components
- `src/lib/` – storage, rewards, wallet helpers
- `src/app/api/` – server routes

## Operations
- Rotate API secrets regularly
- Ensure testnet wallets are funded before demos (XRPL seed or EVM deployer)
- Monitor RPC health; switch RPC URLs if a provider is down

## License
MIT
