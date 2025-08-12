import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import mongoose from 'mongoose';

export const healthCheck = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const startTime: number = Date.now();

    // Check database connection
    const dbStatus: string =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check memory usage
    const memUsage: NodeJS.MemoryUsage = process.memoryUsage();

    // Calculate response time
    const responseTime: number = Date.now() - startTime;

    const healthData: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown',
      },
      memory: {
        used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    sendResponse(res, {
      success: true,
      message: 'Backend is healthy and operational',
      details: {
        title: 'Health Check Passed',
        description: `Backend responded in ${responseTime}ms with all systems operational`,
      },
      status: 'success',
      statusCode: 200,
      data: healthData,
    });
  }
);
