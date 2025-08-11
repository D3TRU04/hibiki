## Kleo MVP Setup Guide

This guide helps you configure all external services and environment variables required to run the Kleo MVP end‑to‑end.

### Overview
- Auth: Dynamic.xyz (EVM + XRPL)
- Storage: web3.storage (IPFS)
- AI: OpenAI (news summaries + credibility check)
- Maps: Mapbox GL JS
- Blockchain events indexing: The Graph
- NFT minting (MVP default): XRPL testnet (XLS‑20) via `xrplNFTService`
- NFT minting (optional): Ripple EVM Sidechain ERC‑721

---

### 1) Prerequisites
- Node.js 18+ and npm or yarn
- A modern browser (for Mapbox and Dynamic auth)
- Installed Graph CLI (only if deploying the subgraph)
  - `npm i -g @graphprotocol/graph-cli`
- Installed Hardhat (only if using the EVM path)
  - `npm i`

---

### 2) Environment Variables
Create a `.env.local` in the project root (not committed). Copy and fill the values below:

```bash
# OpenAI (required for AI summaries and credibility)
OPENAI_API_KEY=sk-...

# web3.storage (required for IPFS storage)
WEB3_STORAGE_TOKEN=...

# Mapbox (required for the map UI)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.ey...

# Dynamic.xyz (required for wallet auth)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=env_...

# The Graph (required for data queries from your subgraph)
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<subgraph-id>/<version>

# XRPL (NFT minting and XRP reward simulation)
XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233
XRPL_WALLET_SEED=sn... # Testnet seed for the server-side funder wallet

# Rewards simulation tuning (optional)
# Drops per point: 1 XRP = 1,000,000 drops. Defaults: 10,000 drops (0.01 XRP) per point
XRPL_DROPS_PER_POINT=10000
# Max per transaction (drops). Default: 1,000,000 drops (1 XRP)
XRPL_MAX_DROPS_PER_TX=1000000
# Minimum amount (drops). Default: 1000 drops (0.001 XRP)
XRPL_MIN_DROPS=1000

# EVM reward tuning (optional)
# Wei per point on Ripple EVM testnet (18 decimals). Default ~0.01 XRP
EVM_WEI_PER_POINT=10000000000000000
# Max per tx in wei. Default 1 XRP
EVM_MAX_WEI_PER_TX=1000000000000000000
# Min per tx in wei. Default 0.0001 XRP
EVM_MIN_WEI=100000000000000

# Optional: EVM sidechain (Ripple EVM Testnet) – only if you use ERC‑721 flow
RIPPLE_EVM_RPC_URL=https://rpc-evm-sidechain.xrpl.org
EVM_DEPLOYER_PRIVATE_KEY=0x...
NEXT_PUBLIC_EVM_NFT_CONTRACT=0xYourDeployedContract
```

Notes:
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep secrets server‑side.
- If `OPENAI_API_KEY` is missing, the app falls back to simulated summaries (suitable for local dev only).

---

### 3) Service Setup

#### A) OpenAI
- Create an API key at `https://platform.openai.com` (Billing may be required).
- Set `OPENAI_API_KEY`.

#### B) web3.storage (IPFS)
- Create an account and API token at `https://web3.storage`.
- Set `WEB3_STORAGE_TOKEN`.

#### C) Mapbox
- Create/access a token at `https://account.mapbox.com`.
- Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

#### D) Dynamic.xyz
- Create a project and get the environment ID from Dynamic dashboard.
- Enable EVM providers (MetaMask, WalletConnect, Coinbase) and XRPL (fallback/XUMM if configured).
- Set `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`.

#### E) The Graph (Subgraph)
1) Update `subgraph/subgraph.yaml` with the correct network/RPC and contract address (if using EVM). For XRPL events, ensure your event source matches what you actually emit.
2) Build & deploy:
   ```bash
   cd subgraph
   graph codegen
   graph build
   graph deploy --studio <your-subgraph-name>
   ```
3) Set `NEXT_PUBLIC_SUBGRAPH_URL` to the deployed GraphQL endpoint shown after deploy.

#### F) XRPL Testnet (Default NFT path)
- Get a testnet wallet and fund it via the XRPL faucet.
- Set `XRPL_RPC_URL` to testnet (`wss://s.altnet.rippletest.net:51233`).
- Set `XRPL_WALLET_SEED` for the minter/airdrop sender used by `xrplNFTService` and rewards API.
- Ensure the wallet has enough test XRP to mint and simulate rewards.

#### G) Ripple EVM Sidechain (Optional ERC‑721 path)
If you choose ERC‑721 NFTs instead of XRPL for a run:
1) Set `RIPPLE_EVM_RPC_URL` and `EVM_DEPLOYER_PRIVATE_KEY`.
2) Compile and deploy the contract:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network rippleEvmTestnet
   ```
3) Copy the deployed address to `NEXT_PUBLIC_EVM_NFT_CONTRACT`.
4) Make sure the contract emits `PostSubmitted`, `NFTMinted`, and `RewardClaimed` events as defined by your subgraph.

---

### 4) Install & Run Locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

---

### 5) Feature Checklist (Quick QA)
- Auth
  - Connect via Dynamic in header, `My Profile` link appears
  - Anonymous users cannot post
- Map
  - Map loads with Mapbox token
  - Click map opens submission modal at clicked location
  - Hover pin: shows AI summary (news) or preview; click pin: full popup
- Submissions
  - News: entering a valid HTTPS URL fetches article (server-side), AI summary appears
  - Video: file uploads (<= 5MB), no AI summary (by design)
  - Rate limit: enforce 1 post / 5 minutes per wallet (client-side)
  - IPFS: metadata uploaded via web3.storage; `post_cid` returns
  - NFT: on success, XRPL mint simulated (or EVM path if you configured it)
- Profiles
  - `/profile/[wallet]` shows XP, posts (from The Graph), NFTs
- Search/Indexing
  - The Graph indexes `PostSubmitted`, `NFTMinted`, `RewardClaimed`
  - Filter by `media_type = "link"` and search `summary_text` via Graph queries

---

### 6) Common Troubleshooting
- OpenAI errors or empty summary
  - Check `OPENAI_API_KEY`; without it, summaries are simulated
- Map not loading
  - Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- IPFS upload failing
  - Validate `WEB3_STORAGE_TOKEN` and network connectivity
- Dynamic auth issues
  - Confirm `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` and provider setup in dashboard
- XRPL minting fails
  - Ensure testnet wallet is funded; `XRPL_RPC_URL` points to testnet
- The Graph returns no data
  - Confirm subgraph deployed, endpoint set in `NEXT_PUBLIC_SUBGRAPH_URL`, ABI/events match
- EVM contract
  - Verify RPC, private key, and that events match `subgraph/abis/KleoEvents.json`

---

### 7) Security & Ops Notes
- Never commit secrets. `.env.local` should remain local.
- Rotate tokens/keys periodically for OpenAI/web3.storage/Dynamic.
- Re‑deploy the subgraph when changing contract address or event signatures.

---

### 8) Behavior Notes / Scope
- Media types supported: `video` and `news` only
- AI summarization: news only (videos display embedded player)
- All media and metadata stored on IPFS via web3.storage
- Client‑side rate limiting only for MVP
- Tags removed across codebase as requested
- Files refactored so none exceed ~200 lines

---

### 9) Local Testing Tips
- Clear local storage to reset rate limits/XPs:
  - Keys that may be present: `kleo_contributor_id`, rate-limit keys, XP caches
- Use small sample videos (<5MB)
- Use well‑known news URLs during testing for cleaner AI output

If you get stuck, start by verifying environment variables and the subgraph endpoint. Most runtime issues are configuration‑related. 