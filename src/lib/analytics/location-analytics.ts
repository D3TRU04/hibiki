import { graphDB } from '../web3-storage';

export interface LocationStats {
  lat: number;
  lng: number;
  postCount: number;
  totalEngagement: number;
  averageCredibility: number;
  topSources: string[];
  recentActivity: string;
  mediaBreakdown: {
    video: number;
    news: number;
  };
}

export function getLocationAnalytics(lat: number, lng: number, radius: number = 0.1): LocationStats {
  const posts = graphDB.posts.filter(post => {
    const distance = Math.sqrt(
      Math.pow(post.lat - lat, 2) + 
      Math.pow(post.lng - lng, 2)
    );
    return distance <= radius;
  });

  const sources = posts
    .filter(post => post.source_url)
    .map(post => new URL(post.source_url!).hostname)
    .reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSources = Object.entries(sources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source]) => source);

  const totalCredibility = posts
    .filter(post => post.credibility_score !== undefined)
    .reduce((sum, post) => sum + (post.credibility_score || 0), 0);

  const mediaBreakdown = posts.reduce((acc, post) => {
    if (post.media_type === 'video') acc.video++;
    if (post.media_type === 'news') acc.news++;
    return acc;
  }, { video: 0, news: 0 });

  const recentPost = posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return {
    lat,
    lng,
    postCount: posts.length,
    totalEngagement: posts.reduce((sum, post) => sum + (post.reward_points || 0), 0),
    averageCredibility: posts.length > 0 ? totalCredibility / posts.length : 0,
    topSources,
    recentActivity: recentPost ? recentPost.created_at : 'No recent activity',
    mediaBreakdown
  };
} 