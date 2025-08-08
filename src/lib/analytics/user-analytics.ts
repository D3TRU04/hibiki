import { graphDB } from '../web3-storage';

export interface UserStats {
  wallet_address: string;
  totalPosts: number;
  totalRewards: number;
  averageCredibility: number;
  activeLocations: number;
  preferredMediaType: 'video' | 'news' | 'mixed';
  postingFrequency: number;
  reputationScore: number;
  topSources: string[];
  activityTimeline: Array<{
    date: string;
    posts: number;
    rewards: number;
  }>;
}

export function getUserAnalytics(walletAddress: string): UserStats {
  const userPosts = graphDB.posts.filter(post => 
    post.wallet_address.toLowerCase() === walletAddress.toLowerCase()
  );

  const locations = new Set(userPosts.map(post => `${post.lat},${post.lng}`));
  
  const sources = userPosts
    .filter(post => post.source_url)
    .map(post => new URL(post.source_url!).hostname)
    .reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSources = Object.entries(sources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([source]) => source);

  const mediaTypes = userPosts.reduce((acc, post) => {
    acc[post.media_type] = (acc[post.media_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredMediaType = Object.entries(mediaTypes)
    .sort(([,a], [,b]) => b - a)[0]?.[0] as 'video' | 'news' || 'mixed';

  const totalCredibility = userPosts
    .filter(post => post.credibility_score !== undefined)
    .reduce((sum, post) => sum + (post.credibility_score || 0), 0);

  const averageCredibility = userPosts.length > 0 ? totalCredibility / userPosts.length : 0;

  // Calculate reputation score based on credibility and engagement
  const reputationScore = Math.min(100, Math.round(
    (averageCredibility * 0.6) + 
    (Math.min(userPosts.length, 50) * 0.8) + 
    (locations.size * 0.4)
  ));

  // Calculate posting frequency (posts per week)
  const firstPost = userPosts.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )[0];
  
  const weeksSinceFirst = firstPost 
    ? Math.max(1, (Date.now() - new Date(firstPost.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 1;

  return {
    wallet_address: walletAddress,
    totalPosts: userPosts.length,
    totalRewards: userPosts.reduce((sum, post) => sum + (post.reward_points || 0), 0),
    averageCredibility,
    activeLocations: locations.size,
    preferredMediaType,
    postingFrequency: userPosts.length / weeksSinceFirst,
    reputationScore,
    topSources,
    activityTimeline: generateActivityTimeline(userPosts)
  };
}

function generateActivityTimeline(posts: any[]): Array<{
  date: string;
  posts: number;
  rewards: number;
}> {
  const timeline = posts.reduce((acc, post) => {
    const date = new Date(post.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { posts: 0, rewards: 0 };
    }
    acc[date].posts++;
    acc[date].rewards += post.reward_points || 0;
    return acc;
  }, {} as Record<string, { posts: number; rewards: number }>);

  return Object.entries(timeline)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
} 