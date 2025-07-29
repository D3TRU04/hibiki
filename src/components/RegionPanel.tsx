'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Radio, Newspaper, User, Volume2 } from 'lucide-react';
import { Region, Story, NewsItem, RadioStation, FilterOptions } from '@/types';
import StoryCard from './StoryCard';
import ContributorBadge from './ContributorBadge';

interface RegionPanelProps {
  region: Region;
  onClose: () => void;
}

// Mock data - in production this would come from APIs
const mockStories: Story[] = [
  {
    id: '1',
    title: 'Local Market Update',
    content: 'The downtown market is bustling with new vendors this week. Fresh produce and local crafts are drawing crowds.',
    summary: 'Downtown market sees increased activity with new vendors and fresh produce.',
    type: 'user_story',
    region: 'new-york',
    contributorId: 'contributor-1',
    contributor: {
      id: 'contributor-1',
      username: 'LocalReporter',
      trustScore: 85,
      region: 'new-york',
      storyCount: 12,
      hasStoryNodeNFT: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    trustScore: 85,
    upvotes: 23,
    downvotes: 2,
    tags: ['market', 'local-business'],
    language: 'en',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Weather Alert',
    content: 'Heavy rain expected in the next few hours. Local authorities advise caution on roads.',
    summary: 'Heavy rainfall warning issued for the region.',
    type: 'news',
    region: 'new-york',
    contributorId: 'contributor-2',
    contributor: {
      id: 'contributor-2',
      username: 'WeatherWatch',
      trustScore: 92,
      region: 'new-york',
      storyCount: 45,
      hasStoryNodeNFT: true,
      createdAt: '2024-01-10T08:00:00Z'
    },
    trustScore: 92,
    upvotes: 156,
    downvotes: 8,
    tags: ['weather', 'alert'],
    language: 'en',
    createdAt: '2024-01-20T13:15:00Z',
    updatedAt: '2024-01-20T13:15:00Z'
  }
];

const mockNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'City Council Approves New Development Plan',
    description: 'The city council has approved a new development plan that will bring affordable housing to the downtown area.',
    url: 'https://example.com/news/1',
    source: 'Local News',
    publishedAt: '2024-01-20T12:00:00Z',
    region: 'new-york'
  },
  {
    id: 'news-2',
    title: 'Tech Startup Raises $10M in Funding',
    description: 'Local tech startup announces successful funding round, plans to hire 50 new employees.',
    url: 'https://example.com/news/2',
    source: 'Business Daily',
    publishedAt: '2024-01-20T11:30:00Z',
    region: 'new-york'
  }
];

const mockRadioStations: RadioStation[] = [
  {
    id: 'radio-1',
    name: 'Local FM 101.5',
    url: 'https://stream.example.com/local-fm',
    favicon: 'https://example.com/favicon1.ico',
    country: 'US',
    language: 'en',
    tags: ['news', 'local'],
    region: 'new-york'
  },
  {
    id: 'radio-2',
    name: 'Jazz Radio 88.3',
    url: 'https://stream.example.com/jazz-radio',
    favicon: 'https://example.com/favicon2.ico',
    country: 'US',
    language: 'en',
    tags: ['jazz', 'music'],
    region: 'new-york'
  }
];

export default function RegionPanel({ region, onClose }: RegionPanelProps) {
  const [activeTab, setActiveTab] = useState<'stories' | 'news' | 'radio'>('stories');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: 'all',
    trustLevel: 'all',
    language: 'all',
    timeRange: 'all'
  });
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [radioStations, setRadioStations] = useState<RadioStation[]>(mockRadioStations);

  const tabs = [
    { id: 'stories', label: 'Stories', icon: User, count: stories.length },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
    { id: 'radio', label: 'Radio', icon: Radio, count: radioStations.length }
  ];

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {region.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {region.country} • {region.population?.toLocaleString()} people
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500 dark:text-gray-400" />
          <select
            value={filterOptions.type}
            onChange={(e) => setFilterOptions({ ...filterOptions, type: e.target.value as any })}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="news">News</option>
            <option value="radio">Radio</option>
            <option value="user_story">User Stories</option>
            <option value="audio_report">Audio Reports</option>
          </select>
          <select
            value={filterOptions.trustLevel}
            onChange={(e) => setFilterOptions({ ...filterOptions, trustLevel: e.target.value as any })}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1"
          >
            <option value="all">All Trust Levels</option>
            <option value="verified">Verified</option>
            <option value="trusted">Trusted</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'stories' && (
          <div className="p-4 space-y-4">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="p-4 space-y-4">
            {news.map((item) => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{item.source}</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'radio' && (
          <div className="p-4 space-y-4">
            {radioStations.map((station) => (
              <div key={station.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {station.favicon && (
                    <img src={station.favicon} alt="" className="w-8 h-8 rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {station.tags.join(', ')}
                    </p>
                  </div>
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 