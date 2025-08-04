import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import submitHealthData from '../controllers/HealthData/submit-health-data.js';
import getDuelHealthData from '../controllers/HealthData/get-duel-health-data.js';
import startHealthMonitoring from '../controllers/HealthData/start-health-monitoring.js';

const router = Router();

// Submit health data during an active duel
router.post('/submit', authenticate, submitHealthData);

// Get health data for a specific duel
router.get('/duel/:duelId', authenticate, getDuelHealthData);

// Start health monitoring for a duel
router.post('/start-monitoring', authenticate, startHealthMonitoring);

export default router;
