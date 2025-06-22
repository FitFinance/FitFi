import { Router } from 'express';

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import searchOpponent from '../controllers/Duels/search-opponent.js';
import activeDuels from '../controllers/Duels/active-duels.js';
import validateRequiredEnvVariables from '../middleware/validate-required-env-variables.js';

const DuelRoutes: Router = Router();

DuelRoutes.post(
  '/search-opponent',
  validateRequiredEnvVariables('JWT_SECRET'),
  authenticate,
  authorize('user'),
  searchOpponent
);
DuelRoutes.get('/active-duels', authenticate, authorize('user'), activeDuels);
export default DuelRoutes;
