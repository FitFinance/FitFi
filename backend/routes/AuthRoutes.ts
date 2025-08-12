import express, { Router } from 'express';

import invalidRoute from '../controllers/Auth/invalid-route.js';
// Removed legacy nonce + OTP + multi-step login controllers
import walletAuth from '../controllers/Auth/wallet-auth.js';
import walletGetMessage from '../controllers/Auth/wallet-get-message.js';
import updateProfile from '../controllers/Auth/update-profile.js';
import getProfile from '../controllers/Auth/get-profile.js';
import validateRequiredEnvVariables from '../middleware/validate-required-env-variables.js';
import authenticate from '../middleware/authenticate.js';

const AuthRoutes: Router = express.Router();

// (Removed routes: /get-nonce, /request-otp, /verify-otp, /verify-and-login)
// New simplified wallet authentication endpoint
AuthRoutes.post(
  '/wallet-auth',
  validateRequiredEnvVariables('JWT_SECRET', 'JWT_TTL'),
  walletAuth
);
AuthRoutes.post('/wallet-get-message', walletGetMessage);

// Protected routes (require authentication)
AuthRoutes.use(authenticate); // All routes below this will require authentication

AuthRoutes.get('/profile', getProfile);
AuthRoutes.patch('/profile', updateProfile);

AuthRoutes.all('{*any}', invalidRoute);

export default AuthRoutes;
