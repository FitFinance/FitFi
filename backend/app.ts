import express from 'express';
import cors from 'cors';

// ! Check if having any of these middlewares cause disruption in the working of app
// ! something like blocking body of the request
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';
// import xss from 'xss-clean';

import AuthRoutes from './routes/AuthRoutes.js';
import ChallengeRoutes from './routes/ChallengeRoutes.js';
import DuelRoutes from './routes/DuelRoutes.js';
import HealthDataRoutes from './routes/HealthDataRoutes.js';

import invalidRouteHandler from './middleware/invalid-route.js';
import globalErrorHandler from './controllers/globalErrorHandler.js';
import defaultApiResponse from './middleware/default-api-response.js';

const app: express.Express = express();

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  })
);
// app.use(mongoSanitize());
// app.use(xss());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const primaryRouter: express.Router = express.Router();

primaryRouter.use('/auth', AuthRoutes);
primaryRouter.use('/challenges', ChallengeRoutes);
primaryRouter.use('/duels', DuelRoutes);
primaryRouter.use('/health-data', HealthDataRoutes);
primaryRouter.get('/', defaultApiResponse);
app.use('/api/v1', primaryRouter);

app.all('{*any}', invalidRouteHandler);

app.use(globalErrorHandler);

export default app;
