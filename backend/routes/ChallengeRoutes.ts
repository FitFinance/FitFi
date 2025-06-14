import express from 'express';
import getChallenges from '../controllers/Challenge/get-challenges.js';

const ChallengeRoutes: express.Router = express.Router();

ChallengeRoutes.get('/', getChallenges);

export default ChallengeRoutes;
