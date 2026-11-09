import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health.router.js';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';

import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

// Manejo centralizado de errores
app.use(errorHandler);

export default app;