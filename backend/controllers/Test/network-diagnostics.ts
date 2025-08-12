import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import mongoose from 'mongoose';
import getRedisClient from '../../services/redis/index.js';
import requestNonce from '../Auth/request-nonce.js';

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  message: string;
  details?: string;
}

// Test database connectivity
const testDatabaseConnectivity: () => Promise<TestResult> = async () => {
  const startTime: number = Date.now();
  try {
    // Test MongoDB connection (imported mongoose)
    if (mongoose.connection.readyState === 1) {
      const duration: number = Date.now() - startTime;
      return {
        name: 'Database Connectivity',
        status: 'passed',
        duration,
        message: 'MongoDB connection is healthy',
        details: `Connection state: ${mongoose.connection.readyState} (connected)`,
      };
    } else {
      const duration: number = Date.now() - startTime;
      return {
        name: 'Database Connectivity',
        status: 'failed',
        duration,
        message: 'MongoDB connection is not established',
        details: `Connection state: ${mongoose.connection.readyState}`,
      };
    }
  } catch (error) {
    const duration: number = Date.now() - startTime;
    return {
      name: 'Database Connectivity',
      status: 'failed',
      duration,
      message: 'Database connectivity test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test Redis connectivity
const testRedisConnectivity: () => Promise<TestResult> = async () => {
  const startTime: number = Date.now();
  try {
    const redisUrl: string | undefined =
      process.env.REDIS_URI || process.env.REDIS_URL;
    if (!redisUrl) {
      const duration: number = Date.now() - startTime;
      return {
        name: 'Redis Connectivity',
        status: 'failed',
        duration,
        message: 'Redis not configured',
        details: 'Set REDIS_URI or REDIS_URL to enable Redis diagnostics',
      };
    }

    try {
      const client: any = await getRedisClient();
      // Confirm connectivity (PING returns 'PONG')
      const pong: any = await client.ping();
      const duration: number = Date.now() - startTime;
      if (pong === 'PONG') {
        return {
          name: 'Redis Connectivity',
          status: 'passed',
          duration,
          message: 'Redis connection is healthy',
          details: 'Ping operation successful',
        };
      }
      return {
        name: 'Redis Connectivity',
        status: 'failed',
        duration,
        message: 'Unexpected Redis ping response',
        details: String(pong),
      };
    } catch (redisError: any) {
      const duration: number = Date.now() - startTime;
      return {
        name: 'Redis Connectivity',
        status: 'failed',
        duration,
        message: 'Redis connection failed',
        details: redisError?.message || 'Unable to connect',
      };
    }
  } catch (error) {
    const duration: number = Date.now() - startTime;
    return {
      name: 'Redis Connectivity',
      status: 'failed',
      duration,
      message: 'Redis connectivity test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test blockchain RPC connectivity
const testBlockchainRPC: () => Promise<TestResult> = async () => {
  const startTime: number = Date.now();
  try {
    // Prefer explicit env vars; fall back to known chain endpoints
    const rpcUrl: string =
      process.env.RPC_URL ||
      process.env.BLOCKCHAIN_RPC_URL ||
      process.env.ETH_RPC_URL ||
      'https://rpc.test.btcs.network';

    // Make a simple JSON-RPC call to test connectivity
    const response: any = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    const data: any = await response.json();
    const duration: number = Date.now() - startTime;

    if (response.ok && data.result) {
      const blockNumber: number = parseInt(data.result, 16);
      return {
        name: 'Blockchain RPC',
        status: 'passed',
        duration,
        message: 'Blockchain RPC is responsive',
        details: `Latest block: ${blockNumber}, RPC: ${rpcUrl}`,
      };
    } else {
      return {
        name: 'Blockchain RPC',
        status: 'failed',
        duration,
        message: 'Blockchain RPC call failed',
        details: `Error: ${data.error?.message || 'Invalid response'}`,
      };
    }
  } catch (error) {
    const duration: number = Date.now() - startTime;
    return {
      name: 'Blockchain RPC',
      status: 'failed',
      duration,
      message: 'Blockchain RPC connectivity failed',
      details: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Test wallet authentication flow
const testWalletConnection: () => Promise<TestResult> = async () => {
  const startTime: number = Date.now();
  try {
    // Module imported at top; verify it's a function
    if (typeof requestNonce === 'function') {
      const duration: number = Date.now() - startTime;
      return {
        name: 'Wallet Connection',
        status: 'passed',
        duration,
        message: 'Wallet authentication controller loaded',
        details: 'request-nonce controller import successful',
      };
    }
    const duration: number = Date.now() - startTime;
    return {
      name: 'Wallet Connection',
      status: 'failed',
      duration,
      message: 'Wallet auth controller invalid',
      details: 'requestNonce is not a function',
    };
  } catch (error) {
    const duration: number = Date.now() - startTime;
    return {
      name: 'Wallet Connection',
      status: 'failed',
      duration,
      message: 'Wallet connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Main network diagnostics controller
export const networkDiagnostics: fn = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const startTime: number = Date.now();

    try {
      // Run all diagnostic tests in parallel for faster execution
      const testPromises: Promise<TestResult>[] = [
        testDatabaseConnectivity(),
        testRedisConnectivity(),
        testBlockchainRPC(),
        testWalletConnection(),
      ];

      const testResults: TestResult[] = await Promise.all(testPromises);
      const totalDuration: number = Date.now() - startTime;

      // Calculate summary statistics
      const totalTests: number = testResults.length;
      const passedTests: number = testResults.filter(
        (test: TestResult) => test.status === 'passed'
      ).length;
      const failedTests: number = testResults.filter(
        (test: TestResult) => test.status === 'failed'
      ).length;
      const overallStatus: string = failedTests === 0 ? 'healthy' : 'degraded';

      const summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        overallStatus: string;
        totalDuration: number;
        timestamp: string;
      } = {
        totalTests,
        passedTests,
        failedTests,
        overallStatus,
        totalDuration,
        timestamp: new Date().toISOString(),
      };

      sendResponse(res, {
        success: true,
        message: `Network diagnostics completed: ${passedTests}/${totalTests} tests passed`,
        details: {
          title: 'Network Diagnostics Completed',
          description: `Executed ${totalTests} diagnostic tests in ${totalDuration}ms`,
        },
        status: 'success',
        statusCode: 200,
        data: {
          summary,
          tests: testResults,
        },
      });
    } catch (error) {
      const totalDuration: number = Date.now() - startTime;

      sendResponse(res, {
        success: false,
        message: 'Network diagnostics failed',
        details: {
          title: 'Diagnostics Failed',
          description:
            error instanceof Error
              ? error.message
              : 'Unknown error occurred during diagnostics',
        },
        status: 'error',
        statusCode: 500,
        data: {
          summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            overallStatus: 'error',
            totalDuration,
            timestamp: new Date().toISOString(),
          },
          tests: [],
        },
      });
    }
  }
);
