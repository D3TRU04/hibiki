import { User, CreateUserData } from './types';
import { web3StorageService } from './web3-storage';

// Local storage for user session
const USER_SESSION_KEY = 'kleo_user_session';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    // Create user profile
    const user: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      wallet_address: userData.wallet_address,
      wallet_type: userData.wallet_type,
      ens_name: userData.ens_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_posts: 0,
      total_xp: 0,
      reputation_score: 0
    };

    // Upload to IPFS
    const userCID = await web3StorageService.uploadUserProfile(user);

    // Store in local storage for session management
    if (isBrowser) {
      const sessionData = {
        user,
        userCID,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionData));
    }

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user profile');
  }
}

export function getCurrentUser(): User | null {
  if (!isBrowser) return null;

  try {
    const sessionData = localStorage.getItem(USER_SESSION_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      return parsed.user;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  return null;
}

export function updateUserSession(user: User): void {
  if (!isBrowser) return;

  try {
    const sessionData = {
      user,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error updating user session:', error);
  }
}

export function clearUserSession(): void {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
} 