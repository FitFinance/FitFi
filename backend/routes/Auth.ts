import express, { Router } from 'express';
import invalidRoute from '../controllers/Auth/invalid-route.js';
import testGenToken from '../controllers/Auth/test-gen-token.js';

const AuthRoutes: Router = express.Router();

if (process.env.NODE_ENV == 'development') {
  AuthRoutes.get('/test-gen-token', testGenToken);
}

AuthRoutes.all('{*any}', invalidRoute);

export default AuthRoutes;
