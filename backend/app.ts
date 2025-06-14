import express from 'express';
import cors from 'cors';
import globalErrorHandler from './controllers/globalErrorHandler.js';

import AuthRoutes from './routes/AuthRoutes.js';

import invalidRouteHandler from './middleware/invalid-route.js';
import defaultApiResponse from './middleware/default-api-response.js';
import challengeRoutes from './routes/ChallengeRoutes.js';

const app: express.Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const primaryRouter: express.Router = express.Router();

primaryRouter.get('/', defaultApiResponse);
primaryRouter.use('/auth', AuthRoutes);
primaryRouter.use('/challenges', challengeRoutes);

app.use('/api/v1', primaryRouter);

app.all('/{*any}', invalidRouteHandler);

app.use(globalErrorHandler);

export default app;
