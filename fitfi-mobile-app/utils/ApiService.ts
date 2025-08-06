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
    const query = userId ? `?userId=${userId}` : '';
    return this.makeRequest(`/duels${query}`);
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
