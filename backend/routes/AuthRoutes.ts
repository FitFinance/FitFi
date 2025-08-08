import express, { Router } from 'express';

import invalidRoute from '../controllers/Auth/invalid-route.js';
import verifyAndLogin from '../controllers/Auth/verify-and-login.js';
import requestNonce from '../controllers/Auth/request-nonce.js';
import requestOtp from '../controllers/Auth/request-otp.js';
import verifyOtp from '../controllers/Auth/verify-otp.js';
import validateRequiredEnvVariables from '../middleware/validate-required-env-variables.js';

const AuthRoutes: Router = express.Router();

AuthRoutes.post('/get-nonce', requestNonce);
AuthRoutes.post('/request-otp', requestOtp);
AuthRoutes.post('/verify-otp', verifyOtp);
AuthRoutes.post(
  '/verify-and-login',
  validateRequiredEnvVariables('JWT_SECRET', 'JWT_TTL'),
  verifyAndLogin
);

AuthRoutes.all('{*any}', invalidRoute);

export default AuthRoutes;
