## Kleo Setup Guide (Production)

This guide covers the required services, environment variables, and deployment steps to run Kleo in production.

### 1) Prerequisites
- Node.js 18+
- Mapbox account (access token)
- Dynamic account (environment ID)
- Pinata account (JWT) or alternative IPFS service
- Optional: Ripple EVM Sidechain RPC and deployer private key; XRPL Testnet seed for L1 rewards

### 2) Environment Variables
Create `.env` in the project root (not committed):

```bash
# OpenAI (optional: summaries/credibility)
OPENAI_API_KEY=sk-...

# Mapbox (required)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.ey...

# Dynamic (required for wallet auth)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=env_...

# IPFS (Pinata JWT; server-side)
PINATA_JWT=...

# The Graph (optional)
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<id>/<version>

# XRPL L1 rewards (optional)
XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233
XRPL_WALLET_SEED=sn...
XRPL_DROPS_PER_POINT=10000
XRPL_MAX_DROPS_PER_TX=1000000
XRPL_MIN_DROPS=1000

# Ripple EVM Sidechain rewards (optional)
RIPPLE_EVM_RPC_URL=https://rpc.testnet.xrplevm.org/
EVM_DEPLOYER_PRIVATE_KEY=0x...
NEXT_PUBLIC_EVM_CHAIN_ID=1449000
NEXT_PUBLIC_EVM_CHAIN_NAME=XRPL EVM Sidechain Testnet
NEXT_PUBLIC_EVM_RPC_URL=https://rpc.testnet.xrplevm.org/
NEXT_PUBLIC_EVM_CURRENCY=XRP
NEXT_PUBLIC_EVM_BLOCK_EXPLORER_URL=https://explorer.testnet.xrplevm.org/

# EVM reward sizing (defaults are safe)
EVM_WEI_PER_POINT=10000000000000000
EVM_MAX_WEI_PER_TX=1000000000000000000
EVM_MIN_WEI=100000000000000
```

Notes:
- Only `NEXT_PUBLIC_*` variables are exposed to the browser. Keep secrets server‑side.
- You can enable either XRPL L1, EVM sidechain, both, or neither. The app runs without payouts as well.

### 3) Service Configuration
- Mapbox: generate a token at your dashboard and set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- Dynamic: create a project, copy the environment ID to `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`.
- Pinata: generate a JWT and set `PINATA_JWT`.
- XRPL Testnet: fund the seed used by `XRPL_WALLET_SEED` before enabling L1 rewards.
- Ripple EVM: ensure the deployer address derived from `EVM_DEPLOYER_PRIVATE_KEY` has test XRP and the RPC URL is healthy.

### 4) Install & Run
```bash
npm install
npm run dev
# open http://localhost:3000
```

### 5) Build & Deploy
```bash
npm run build
npm run start
```

For Vercel:
- Connect the repository
- Add all environment variables in Project Settings
- Deploy

### 6) Server Routes
- POST `/api/pinata/upload` – relays uploads to Pinata
- GET  `/api/pinata/list` – lists pinned metadata
- POST `/api/rewards/claim` – XRPL L1 payout (if configured)
- POST `/api/rewards/claim-evm` – EVM sidechain payout (if configured)

### 7) Troubleshooting
- Map not rendering: verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- IPFS upload failing: confirm `PINATA_JWT` and network.
- Rewards failing on EVM: check `RIPPLE_EVM_RPC_URL` health and deployer balance.
- Rewards failing on XRPL: ensure the seed wallet is funded and `XRPL_RPC_URL` targets testnet.
- Subgraph returning no data: confirm the endpoint and deployed entities.

### 8) Operations
- Rotate keys regularly and revoke unused tokens.
- Avoid logging secrets in server logs.
- Monitor RPC providers and switch when necessary. 