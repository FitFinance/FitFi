import { Router } from 'express';

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import searchOpponent from '../controllers/Duels/search-opponent.js';
import validateRequiredEnvVariables from '../middleware/validate-required-env-variables.js';

const DuelRoutes: Router = Router();

DuelRoutes.post(
  '/search-opponent',
  validateRequiredEnvVariables('JWT_SECRET'),
  authenticate,
  authorize('user'),
  searchOpponent
);

export default DuelRoutes;
