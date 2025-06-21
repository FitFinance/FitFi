import express, { Router } from 'express';
import invalidRoute from '../controllers/Auth/invalid-route.js';
// import testGenToken from '../controllers/Auth/test-gen-token.js';
import verifyAndLogin from '../controllers/Auth/verify-and-login.js';
import requestNonce from '../controllers/Auth/request-nonce.js';

const AuthRoutes: Router = express.Router();

if (process.env.NODE_ENV == 'development') {
  // AuthRoutes.get('/test-gen-token', testGenToken);
}

AuthRoutes.post('/get-nonce', requestNonce);
AuthRoutes.post('/verify-and-login', verifyAndLogin);

AuthRoutes.all('{*any}', invalidRoute);

export default AuthRoutes;
