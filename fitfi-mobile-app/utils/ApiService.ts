import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress: string;
  totalEarnings: number;
  totalDuels: number;
  wonDuels: number;
  createdAt: string;
}

export interface Duel {
  _id: string;
  user1: User;
  user2: User;
  challengeType: 'steps' | 'calories' | 'distance';
  stakeAmount: number;
  duration: number; // in minutes
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  winner?: string;
  user1Progress?: number;
  user2Progress?: number;
  createdAt: string;
}

export interface Challenge {
  _id: string;
  name: string;
  description: string;
  challengeType: 'steps' | 'calories' | 'distance';
  targetValue: number;
  duration: number; // in minutes
  reward: number;
  isActive: boolean;
  participants: string[];
  createdAt: string;
}

export interface HealthDataSubmission {
  duelId: string;
  dataType: 'steps' | 'calories' | 'distance';
  value: number;
  timestamp: string;
  source: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = ENV.API_URL;
    console.log('🌐 API Service initialized with URL:', this.baseURL);
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(
          '❌ API Error - Non-JSON response:',
          text.substring(0, 200)
        );

        if (response.status === 401) {
          return {
            success: false,
            message: 'Authentication required. Please log in.',
            error: 'UNAUTHORIZED',
          };
        }

        return {
          success: false,
          message: `Server error (${response.status}): Expected JSON response but got ${contentType}`,
          error: 'INVALID_RESPONSE',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', data);
        return {
          success: false,
          message: data.message || 'Request failed',
          error: data.error,
        };
      }

      console.log('✅ API Success:', endpoint);
      return {
        success: true,
        message: data.message || 'Success',
        data: data.data || data,
      };
    } catch (error) {
      console.error('❌ Network Error:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async requestNonce(
    walletAddress: string
  ): Promise<ApiResponse<{ nonce: number; user?: any }>> {
    return this.makeRequest('/auth/get-nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async verifyAndLogin(
    walletAddress: string,
    signature: string,
    nonce: number
  ): Promise<
    ApiResponse<{
      token: string;
      walletAddress: string;
      nonce: number;
    }>
  > {
    return this.makeRequest('/auth/verify-and-login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, nonce }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    walletAddress: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Duels endpoints
  async getDuels(userId?: string): Promise<ApiResponse<Duel[]>> {
    // Use the active duels endpoint which returns all duels for the authenticated user
    return this.makeRequest('/duels/active');
  }

  async getDuel(duelId: string): Promise<ApiResponse<Duel>> {
    return this.makeRequest(`/duels/${duelId}`);
  }

  async createDuel(duelData: {
    user2Id: string;
    challengeType: 'steps' | 'calories' | 'distance';
    stakeAmount: number;
    duration: number;
  }): Promise<ApiResponse<Duel>> {
    return this.makeRequest('/duels', {
      method: 'POST',
      body: JSON.stringify(duelData),
    });
  }

  async joinDuel(duelId: string): Promise<ApiResponse<Duel>> {
    return this.makeRequest(`/duels/${duelId}/join`, {
      method: 'POST',
    });
  }

  async startDuel(duelId: string): Promise<ApiResponse<Duel>> {
    return this.makeRequest(`/duels/${duelId}/start`, {
      method: 'POST',
    });
  }

  async cancelDuel(duelId: string): Promise<ApiResponse<Duel>> {
    return this.makeRequest(`/duels/${duelId}/cancel`, {
      method: 'DELETE',
    });
  }

  // Challenges endpoints
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    return this.makeRequest('/challenges');
  }

  async getChallenge(challengeId: string): Promise<ApiResponse<Challenge>> {
    return this.makeRequest(`/challenges/${challengeId}`);
  }

  async joinChallenge(challengeId: string): Promise<ApiResponse<Challenge>> {
    return this.makeRequest(`/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  // Health data endpoints
  async submitHealthData(
    healthData: HealthDataSubmission
  ): Promise<ApiResponse> {
    return this.makeRequest('/health-data', {
      method: 'POST',
      body: JSON.stringify(healthData),
    });
  }

  async getHealthData(
    duelId: string,
    userId: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/health-data/${duelId}/${userId}`);
  }

  async getDuelHealthStats(duelId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/health-data/duel/${duelId}/stats`);
  }

  // Test connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.success;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  // Challenge endpoints
  async getAvailableChallenges(): Promise<ApiResponse<any[]>> {
    // For now, use the same endpoint as getChallenges
    // In the future, this could be a separate endpoint for available challenges
    return this.makeRequest('/challenges');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
