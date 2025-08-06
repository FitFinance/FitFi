import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthDataPoint {
  dataType: 'steps' | 'calories' | 'distance' | 'active_time';
  value: number;
  timestamp: Date;
  source: string;
}

export interface DuelHealthData {
  duelId: string;
  userId: string;
  dataPoints: HealthDataPoint[];
  lastSync: Date;
}

class HealthConnectService {
  private isInitialized = false;
  private permissionsGranted = false;

  /**
   * Initialize Health Connect (mock mode for build testing)
   */
  async initialize(): Promise<boolean> {
    try {
      this.isInitialized = true;
      console.log('✅ Health Connect initialized (mock mode)');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Health Connect:', error);
      return false;
    }
  }

  /**
   * Request necessary permissions for fitness data (mock)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      this.permissionsGranted = true;
      console.log('✅ Health Connect permissions granted (mock mode)');
      return true;
    } catch (error) {
      console.error('❌ Failed to request Health Connect permissions:', error);
      return false;
    }
  }

  /**
   * Generate mock fitness data for testing
   */
  private generateMockData(
    dataType: 'steps' | 'calories' | 'distance',
    startTime: Date,
    endTime: Date
  ): HealthDataPoint[] {
    const mockData: HealthDataPoint[] = [];
    const timeDiff = endTime.getTime() - startTime.getTime();
    const intervals = Math.floor(timeDiff / (15 * 60 * 1000)); // 15-minute intervals

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      let value = 0;

      switch (dataType) {
        case 'steps':
          value = Math.floor(Math.random() * 200) + 50; // 50-250 steps per 15 min
          break;
        case 'calories':
          value = Math.floor(Math.random() * 20) + 10; // 10-30 calories per 15 min
          break;
        case 'distance':
          value = Math.random() * 0.2 + 0.1; // 0.1-0.3 km per 15 min
          break;
      }

      mockData.push({
        dataType,
        value,
        timestamp,
        source: 'mock_health_connect',
      });
    }

    console.log(`🎭 Generated ${mockData.length} mock ${dataType} data points`);
    return mockData;
  }

  /**
   * Read steps data (mock)
   */
  async getStepsData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      return this.generateMockData('steps', startTime, endTime);
    } catch (error) {
      console.error('❌ Failed to get steps data:', error);
      return [];
    }
  }

  /**
   * Read calories data (mock)
   */
  async getCaloriesData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      return this.generateMockData('calories', startTime, endTime);
    } catch (error) {
      console.error('❌ Failed to get calories data:', error);
      return [];
    }
  }

  /**
   * Read distance data (mock)
   */
  async getDistanceData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      return this.generateMockData('distance', startTime, endTime);
    } catch (error) {
      console.error('❌ Failed to get distance data:', error);
      return [];
    }
  }

  /**
   * Get all fitness data for a specific time range
   */
  async getAllFitnessData(
    startTime: Date,
    endTime: Date
  ): Promise<{
    steps: HealthDataPoint[];
    calories: HealthDataPoint[];
    distance: HealthDataPoint[];
  }> {
    const [steps, calories, distance] = await Promise.all([
      this.getStepsData(startTime, endTime),
      this.getCaloriesData(startTime, endTime),
      this.getDistanceData(startTime, endTime),
    ]);

    return { steps, calories, distance };
  }

  /**
   * Get the latest cumulative value for a specific data type
   */
  async getLatestCumulativeValue(
    dataType: 'steps' | 'calories' | 'distance',
    startTime: Date
  ): Promise<number> {
    try {
      const endTime = new Date(); // Current time
      let dataPoints: HealthDataPoint[] = [];

      switch (dataType) {
        case 'steps':
          dataPoints = await this.getStepsData(startTime, endTime);
          break;
        case 'calories':
          dataPoints = await this.getCaloriesData(startTime, endTime);
          break;
        case 'distance':
          dataPoints = await this.getDistanceData(startTime, endTime);
          break;
      }

      // Calculate cumulative total
      const total = dataPoints.reduce((sum, point) => sum + point.value, 0);
      console.log(
        `📈 Latest ${dataType} total since ${startTime.toISOString()}: ${total}`
      );

      return total;
    } catch (error) {
      console.error(`❌ Failed to get latest ${dataType} value:`, error);
      return 0;
    }
  }

  /**
   * Start monitoring health data for a duel
   */
  async startDuelMonitoring(
    duelId: string,
    challengeType: 'steps' | 'calories' | 'distance'
  ): Promise<void> {
    try {
      const startTime = new Date();

      // Store duel monitoring info
      await AsyncStorage.setItem(
        `duel_${duelId}_monitoring`,
        JSON.stringify({
          duelId,
          challengeType,
          startTime: startTime.toISOString(),
          isActive: true,
        })
      );

      console.log(`🎯 Started monitoring ${challengeType} for duel ${duelId}`);
    } catch (error) {
      console.error('❌ Failed to start duel monitoring:', error);
    }
  }

  /**
   * Stop monitoring health data for a duel
   */
  async stopDuelMonitoring(duelId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`duel_${duelId}_monitoring`);
      console.log(`🛑 Stopped monitoring for duel ${duelId}`);
    } catch (error) {
      console.error('❌ Failed to stop duel monitoring:', error);
    }
  }

  /**
   * Get current monitoring status for a duel
   */
  async getDuelMonitoringStatus(duelId: string): Promise<{
    isActive: boolean;
    challengeType?: string;
    startTime?: Date;
  }> {
    try {
      const data = await AsyncStorage.getItem(`duel_${duelId}_monitoring`);
      if (!data) return { isActive: false };

      const monitoring = JSON.parse(data);
      return {
        isActive: monitoring.isActive,
        challengeType: monitoring.challengeType,
        startTime: new Date(monitoring.startTime),
      };
    } catch (error) {
      console.error('❌ Failed to get monitoring status:', error);
      return { isActive: false };
    }
  }

  /**
   * Check if Health Connect is available and ready
   */
  async isReady(): Promise<boolean> {
    return this.isInitialized && this.permissionsGranted;
  }

  /**
   * Get readable permission status
   */
  getPermissionStatus(): 'not_requested' | 'granted' | 'denied' | 'mock_mode' {
    if (!this.isInitialized) return 'not_requested';
    if (this.permissionsGranted) return 'mock_mode'; // Indicate we're using mock data
    return 'denied';
  }

  /**
   * Check if using mock data
   */
  isUsingMockData(): boolean {
    return true; // Always true in this simplified version
  }
}

// Export singleton instance
export const healthConnectService = new HealthConnectService();
export default healthConnectService;
