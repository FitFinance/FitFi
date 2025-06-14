import express from 'express';
import getChallenges from '../controllers/Challenge/get-challenges.js';
import authenticate from '../middleware/authenticate.js';
import createChallenge from '../controllers/Challenge/create-challenge.js';
import authorize from '../middleware/authorize.js';

const ChallengeRoutes: express.Router = express.Router();

ChallengeRoutes.get('/', getChallenges);
ChallengeRoutes.post('/', authenticate, authorize('admin'), createChallenge);
export default ChallengeRoutes;
