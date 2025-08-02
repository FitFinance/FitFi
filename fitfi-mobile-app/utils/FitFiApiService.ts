import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface DuelData {
  id: string;
  status: string;
  challenge: {
    unit: 'steps' | 'calories' | 'distance';
    target: number;
    bettingAmount: number;
  };
  user1: {
    id: string;
    username: string;
    walletAddress: string;
  };
  user2: {
    id: string;
    username: string;
    walletAddress: string;
  };
  currentScores?: {
    user1Score: number;
    user2Score: number;
    leader: 'user1' | 'user2' | 'tie';
  };
  duelStartTime?: string;
  duelEndTime?: string;
  duration?: number;
}

export interface HealthDataSubmission {
  duelId: string;
  dataType: 'steps' | 'calories' | 'distance' | 'active_time';
  value: number;
  timestamp: string;
}

class FitFiApiService {
  private authToken: string | null = null;

  /**
   * Initialize the service with stored auth token
   */
  async initialize(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    AsyncStorage.setItem('auth_token', token);
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
    };
  }

  /**
   * Submit health data to the backend
   */
  async submitHealthData(data: HealthDataSubmission): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health-data/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit health data');
      }

      console.log('✅ Health data submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to submit health data:', error);
      throw error;
    }
  }

  /**
   * Start health monitoring for a duel
   */
  async startHealthMonitoring(
    duelId: string,
    durationMinutes: number = 60
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health-data/start-monitoring`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            duelId,
            durationMinutes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to start health monitoring');
      }

      console.log('✅ Health monitoring started:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to start health monitoring:', error);
      throw error;
    }
  }

  /**
   * Get health data for a duel
   */
  async getDuelHealthData(duelId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health-data/duel/${duelId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get duel health data');
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to get duel health data:', error);
      throw error;
    }
  }

  /**
   * Get active duels for the current user
   */
  async getActiveDuels(): Promise<DuelData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/duels/active`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get active duels');
      }

      return result.data || [];
    } catch (error) {
      console.error('❌ Failed to get active duels:', error);
      return [];
    }
  }

  /**
   * Get duel details by ID
   */
  async getDuelDetails(duelId: string): Promise<DuelData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/duels/${duelId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get duel details');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to get duel details:', error);
      return null;
    }
  }

  /**
   * Search for opponent (start a new duel)
   */
  async searchOpponent(challengeId: string, socketId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/duels/search-opponent`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          challenegeId: challengeId, // Note: backend has typo in field name
          socketId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to search for opponent');
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to search for opponent:', error);
      throw error;
    }
  }

  /**
   * Stake for a duel
   */
  async stakeDuel(
    duelId: string,
    stakeAmount: string,
    privateKey: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/duels/stake-duel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          duelId,
          stakeAmount,
          privateKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to stake for duel');
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to stake for duel:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fitFiApiService = new FitFiApiService();
export default fitFiApiService;
