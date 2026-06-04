import express from 'express';
import cors from 'cors';
import routes from './interfaces/routes';
import { errorHandler, notFoundHandler } from './interfaces/middlewares/error.middleware';
import { env } from './infrastructure/database/env';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
