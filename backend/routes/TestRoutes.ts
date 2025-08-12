import { Router } from 'express';
import { healthCheck } from '../controllers/Test/health-check.js';
import { networkDiagnostics } from '../controllers/Test/network-diagnostics.js';

const router: Router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Network diagnostics endpoint
router.get('/network-diagnostics', networkDiagnostics);

export default router;
