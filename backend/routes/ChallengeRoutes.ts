import express from 'express';
import getChallenges from '../controllers/Challenge/get-challenges.js';
import authenticate from '../middleware/authenticate.js';
import createChallenge from '../controllers/Challenge/create-challenge.js';
import authorize from '../middleware/authorize.js';
import validateRequiredEnvVariables from '../middleware/validate-required-env-variables.js';

const ChallengeRoutes: express.Router = express.Router();

ChallengeRoutes.get(
  '/',
  validateRequiredEnvVariables('JWT_SECRET'),
  authenticate,
  getChallenges
);
ChallengeRoutes.post(
  '/',
  validateRequiredEnvVariables('JWT_SECRET'),
  authenticate,
  authorize('admin'),
  createChallenge
);

export default ChallengeRoutes;
