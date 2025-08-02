import {
  initialize,
  requestPermission,
  readRecords,
  HealthConnectPermissions,
} from 'react-native-health-connect';
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
   * Initialize Health Connect
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      const isAvailable = await initialize();
      if (!isAvailable) {
        console.warn('Health Connect is not available on this device');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Health Connect initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Health Connect:', error);
      return false;
    }
  }

  /**
   * Request necessary permissions for fitness data
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      const permissions: HealthConnectPermissions[] = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'ExerciseSession' },
      ];

      const result = await requestPermission(permissions);
      this.permissionsGranted = result.every(
        (permission) => permission.status === 'granted'
      );

      if (this.permissionsGranted) {
        console.log('✅ Health Connect permissions granted');
      } else {
        console.warn('⚠️ Some Health Connect permissions were denied');
      }

      return this.permissionsGranted;
    } catch (error) {
      console.error('❌ Failed to request Health Connect permissions:', error);
      return false;
    }
  }

  /**
   * Read steps data from Health Connect
   */
  async getStepsData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      if (!this.permissionsGranted) {
        console.warn('Health Connect permissions not granted');
        return [];
      }

      const stepsRecords = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      const dataPoints: HealthDataPoint[] = stepsRecords.map((record) => ({
        dataType: 'steps' as const,
        value: record.count,
        timestamp: new Date(record.startTime),
        source: record.metadata?.dataOrigin || 'unknown',
      }));

      console.log(`📊 Retrieved ${dataPoints.length} steps data points`);
      return dataPoints;
    } catch (error) {
      console.error('❌ Failed to get steps data:', error);
      return [];
    }
  }

  /**
   * Read calories data from Health Connect
   */
  async getCaloriesData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      if (!this.permissionsGranted) {
        console.warn('Health Connect permissions not granted');
        return [];
      }

      const caloriesRecords = await readRecords('TotalCaloriesBurned', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      const dataPoints: HealthDataPoint[] = caloriesRecords.map((record) => ({
        dataType: 'calories' as const,
        value: record.energy.inKilocalories,
        timestamp: new Date(record.startTime),
        source: record.metadata?.dataOrigin || 'unknown',
      }));

      console.log(`🔥 Retrieved ${dataPoints.length} calories data points`);
      return dataPoints;
    } catch (error) {
      console.error('❌ Failed to get calories data:', error);
      return [];
    }
  }

  /**
   * Read distance data from Health Connect
   */
  async getDistanceData(
    startTime: Date,
    endTime: Date
  ): Promise<HealthDataPoint[]> {
    try {
      if (!this.permissionsGranted) {
        console.warn('Health Connect permissions not granted');
        return [];
      }

      const distanceRecords = await readRecords('Distance', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      const dataPoints: HealthDataPoint[] = distanceRecords.map((record) => ({
        dataType: 'distance' as const,
        value: record.distance.inMeters / 1000, // Convert to kilometers
        timestamp: new Date(record.startTime),
        source: record.metadata?.dataOrigin || 'unknown',
      }));

      console.log(`🏃 Retrieved ${dataPoints.length} distance data points`);
      return dataPoints;
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
  getPermissionStatus():
    | 'not_requested'
    | 'granted'
    | 'denied'
    | 'not_available' {
    if (!this.isInitialized) return 'not_available';
    if (this.permissionsGranted) return 'granted';
    return 'denied';
  }
}

// Export singleton instance
export const healthConnectService = new HealthConnectService();
export default healthConnectService;
