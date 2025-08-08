import { graphDB } from './web3-storage';
import { getLocationAnalytics, LocationStats } from './analytics/location-analytics';
import { getUserAnalytics, UserStats } from './analytics/user-analytics';

class GraphQueryService {
  constructor() {}

  // Location analytics
  getLocationAnalytics(lat: number, lng: number, radius?: number): LocationStats {
    return getLocationAnalytics(lat, lng, radius);
  }

  // User analytics
  getUserAnalytics(walletAddress: string): UserStats {
    return getUserAnalytics(walletAddress);
  }

  // Trending analysis
  getTrendingAnalysis(timeframe: 'day' | 'week' | 'month' = 'week') {
    const cutoffDate = new Date();
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentPosts = graphDB.posts.filter(post => 
      new Date(post.created_at) >= cutoffDate
    );

    const sourceCount = recentPosts.reduce((acc, post) => {
      if (post.source_url) {
        const domain = new URL(post.source_url).hostname;
        acc[domain] = (acc[domain] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const locationCount = recentPosts.reduce((acc, post) => {
      const key = `${Math.round(post.lat * 10) / 10},${Math.round(post.lng * 10) / 10}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      timeframe,
      totalPosts: recentPosts.length,
      topSources: Object.entries(sourceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source, count })),
      hotspots: Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([location, count]) => {
          const [lat, lng] = location.split(',').map(Number);
          return { lat, lng, count };
        }),
      mediaTypeBreakdown: recentPosts.reduce((acc, post) => {
        acc[post.media_type] = (acc[post.media_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Export graph database for external use
  exportGraphDatabase() {
    return {
      posts: graphDB.posts,
      users: graphDB.users,
      locations: graphDB.locations,
      sources: graphDB.sources,
      relationships: {
        userPosts: graphDB.userEdges,
        locationPosts: graphDB.locationEdges,
        sourcePosts: graphDB.sourceEdges
      }
    };
  }
}

export const graphQueryService = new GraphQueryService(); 