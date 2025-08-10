import { BigInt } from "@graphprotocol/graph-ts"
import {
  NFTMinted as NFTMintedEntity,
  User,
  GlobalStats,
} from "../generated/schema"
import {
  NFTMinted as NFTMintedEvent
} from "../generated/KleoEvents/KleoEvents"

// Global stats ID
const GLOBAL_STATS_ID = "kleo-global-stats"

export function handleNFTMinted(event: NFTMintedEvent): void {
  // Build a string ID from tx hash + log index
  const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

  let entity = new NFTMintedEntity(id)
  
  entity.owner = event.params.owner.toHexString()
  entity.token_id = event.params.tokenId
  entity.ipfs_cid = event.params.ipfsCID
  entity.xrpl_address = event.params.xrplAddress
  entity.xrpl_rewards = event.params.xrplRewards
  entity.transaction_hash = event.transaction.hash.toHexString()
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp

  entity.save()

  // Update or create user
  let user = User.load(entity.owner)
  if (!user) {
    user = new User(entity.owner)
    user.total_nfts = 0
    user.last_activity = BigInt.fromI32(0)
  }
  user.total_nfts = user.total_nfts + 1
  user.last_activity = event.block.timestamp
  user.save()

  // Update global stats
  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  if (!globalStats) {
    globalStats = new GlobalStats(GLOBAL_STATS_ID)
    globalStats.total_nfts = 0
    globalStats.last_updated = BigInt.fromI32(0)
  }
  globalStats.total_nfts = globalStats.total_nfts + 1
  globalStats.last_updated = event.block.timestamp
  globalStats.save()
} 