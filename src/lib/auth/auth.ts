import { getCurrentUser, createUser, updateUser, signOut } from '../api/api';
import { User } from '../types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    if (isBrowser) {
      this.initializeAuth();
    }
  }

  private async initializeAuth() {
    try {
      this.currentUser = await getCurrentUser();
    } catch {
      // No existing user session found
    }
  }

  async signUp(email: string): Promise<User> {
    try {
      // Create user with IPFS storage
      const user = await createUser({
        email,
        wallet_address: undefined, // Will be set later if needed
        xrpl_address: undefined,
        far_score: 0,
        contribution_points: 0
      });

      this.currentUser = user;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string): Promise<User | null> {
    try {
      // For IPFS-based auth, we'll use a simple email-based lookup
      // In a real implementation, you'd want to add proper password verification
      const user = await getCurrentUser();
      
      if (user && user.email === email) {
        this.currentUser = user;
        return user;
      }
      
      // If no user exists, create one
      const newUser = await this.signUp(email);
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut();
      this.currentUser = null;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) {
      this.currentUser = await getCurrentUser();
    }
    return this.currentUser;
  }

  async updateUser(updates: Partial<User>): Promise<User | null> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await updateUser(this.currentUser.id, updates);
      if (updatedUser) {
        this.currentUser = updatedUser;
      }
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async connectXRPLWallet(address: string): Promise<User | null> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await updateUser(this.currentUser.id, {
        xrpl_address: address
      });

      if (updatedUser) {
        this.currentUser = updatedUser;
      }

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUser(): User | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance(); 