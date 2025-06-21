import { Router } from 'express';

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import searchOpponent from '../controllers/Duels/search-opponent.js';

const DuelRoutes: Router = Router();

DuelRoutes.post(
  '/search-opponent',
  authenticate,
  authorize('user'),
  searchOpponent
);

export default DuelRoutes;
