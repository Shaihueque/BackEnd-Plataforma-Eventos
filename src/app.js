import express from 'express';
import healthRouter from './routes/health.router.js'
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

export default app;