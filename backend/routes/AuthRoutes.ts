import express, { Router } from 'express';

import invalidRoute from '../controllers/Auth/invalid-route.js';
import verifyAndLogin from '../controllers/Auth/verify-and-login.js';
import requestNonce from '../controllers/Auth/request-nonce.js';

const AuthRoutes: Router = express.Router();

AuthRoutes.post('/get-nonce', requestNonce);
AuthRoutes.post('/verify-and-login', verifyAndLogin);

AuthRoutes.all('{*any}', invalidRoute);

export default AuthRoutes;
