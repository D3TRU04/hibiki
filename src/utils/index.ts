import { config } from '@/config';

// Time formatting utilities
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Trust score utilities
export const getTrustLevel = (score: number) => {
  if (score >= config.trust.levels.verified) return { level: 'Verified', color: 'text-green-600 dark:text-green-400' };
  if (score >= config.trust.levels.trusted) return { level: 'Trusted', color: 'text-blue-600 dark:text-blue-400' };
  if (score >= config.trust.levels.established) return { level: 'Established', color: 'text-yellow-600 dark:text-yellow-400' };
  return { level: 'New', color: 'text-gray-600 dark:text-gray-400' };
};

// Content validation
export const validateStory = (story: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!story.title || story.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }
  
  if (!story.content || story.content.length < config.moderation.minStoryLength) {
    errors.push(`Content must be at least ${config.moderation.minStoryLength} characters long`);
  }
  
  if (story.content && story.content.length > config.moderation.maxStoryLength) {
    errors.push(`Content must be less than ${config.moderation.maxStoryLength} characters`);
  }
  
  if (!story.region) {
    errors.push('Region is required');
  }
  
  if (!story.type) {
    errors.push('Story type is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// API utilities
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${config.api.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateAudioFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 50MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only MP3, WAV, M4A, and AAC files are allowed' };
  }
  
  return { isValid: true };
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Color utilities
export const getTypeColor = (type: string): string => {
  const colors = {
    news: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    radio: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    user_story: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    audio_report: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  };
  
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

// Local storage utilities
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore errors
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 