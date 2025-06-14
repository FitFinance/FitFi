import express from 'express';
import cors from 'cors';

import AuthRoutes from './routes/AuthRoutes.js';
import ChallengeRoutes from './routes/ChallengeRoutes.js';
import DuelRoutes from './routes/DuelRoutes.js';

import invalidRouteHandler from './middleware/invalid-route.js';
import globalErrorHandler from './controllers/globalErrorHandler.js';
import defaultApiResponse from './middleware/default-api-response.js';

const app: express.Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const primaryRouter: express.Router = express.Router();

primaryRouter.get('/', defaultApiResponse);
primaryRouter.use('/auth', AuthRoutes);
primaryRouter.use('/challenges', ChallengeRoutes);
primaryRouter.use('/duels', DuelRoutes);
app.use('/api/v1', primaryRouter);

app.all('/{*any}', invalidRouteHandler);

app.use(globalErrorHandler);

export default app;
