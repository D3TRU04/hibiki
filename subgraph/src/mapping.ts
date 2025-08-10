import { BigInt } from "@graphprotocol/graph-ts"
import {
  NFTMinted as NFTMintedEntity,
  User,
  GlobalStats,
  PostSubmitted as PostSubmittedEntity,
  RewardClaimed as RewardClaimedEntity,
} from "../generated/schema"
import {
  NFTMinted as NFTMintedEvent,
  PostSubmitted as PostSubmittedEvent,
  RewardClaimed as RewardClaimedEvent
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
    user.wallet = entity.owner
    user.total_nfts = 0
    user.total_posts = 0
    user.total_rewards_claimed = 0
    user.total_xp = 0
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
    globalStats.total_posts = 0
    globalStats.total_rewards_claimed = 0
    globalStats.total_xp_distributed = 0
    globalStats.unique_users = 0
    globalStats.last_updated = BigInt.fromI32(0)
  }
  globalStats.total_nfts = globalStats.total_nfts + 1
  globalStats.last_updated = event.block.timestamp
  globalStats.save()
}

export function handlePostSubmitted(event: PostSubmittedEvent): void {
  const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let post = new PostSubmittedEntity(id)
  post.wallet = event.params.owner.toHexString()
  post.post_cid = event.params.postCID
  post.media_type = event.params.mediaType
  post.lat = event.params.lat.toI32() as i32
  post.lng = event.params.lng.toI32() as i32
  post.timestamp = event.block.timestamp
  post.save()

  let user = User.load(post.wallet)
  if (!user) {
    user = new User(post.wallet)
    user.wallet = post.wallet
    user.total_nfts = 0
    user.total_posts = 0
    user.total_rewards_claimed = 0
    user.total_xp = 0
    user.last_activity = BigInt.fromI32(0)
  }
  user.total_posts = user.total_posts + 1
  user.last_activity = event.block.timestamp
  user.save()

  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  if (!globalStats) {
    globalStats = new GlobalStats(GLOBAL_STATS_ID)
    globalStats.total_nfts = 0
    globalStats.total_posts = 0
    globalStats.total_rewards_claimed = 0
    globalStats.total_xp_distributed = 0
    globalStats.unique_users = 0
    globalStats.last_updated = BigInt.fromI32(0)
  }
  globalStats.total_posts = globalStats.total_posts + 1
  globalStats.last_updated = event.block.timestamp
  globalStats.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let reward = new RewardClaimedEntity(id)
  reward.wallet = event.params.owner.toHexString()
  reward.amount = event.params.amount
  reward.total_xp = event.params.totalXP.toI32()
  reward.timestamp = event.block.timestamp
  reward.transaction_hash = event.transaction.hash.toHexString()
  reward.save()

  let user = User.load(reward.wallet)
  if (!user) {
    user = new User(reward.wallet)
    user.wallet = reward.wallet
    user.total_nfts = 0
    user.total_posts = 0
    user.total_rewards_claimed = 0
    user.total_xp = 0
    user.last_activity = BigInt.fromI32(0)
  }
  user.total_rewards_claimed = user.total_rewards_claimed + 1
  user.total_xp = reward.total_xp
  user.last_activity = event.block.timestamp
  user.save()

  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  if (!globalStats) {
    globalStats = new GlobalStats(GLOBAL_STATS_ID)
    globalStats.total_nfts = 0
    globalStats.total_posts = 0
    globalStats.total_rewards_claimed = 0
    globalStats.total_xp_distributed = 0
    globalStats.unique_users = 0
    globalStats.last_updated = BigInt.fromI32(0)
  }
  globalStats.total_rewards_claimed = globalStats.total_rewards_claimed + 1
  globalStats.total_xp_distributed = globalStats.total_xp_distributed + reward.amount.toI32()
  globalStats.last_updated = event.block.timestamp
  globalStats.save()
} 