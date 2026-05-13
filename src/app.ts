import express from 'express';
import { requestLogger } from './middleware/requestLogger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import healthRoutes from './routes/healthRoutes';
import draftRoutes from './routes/draftRoutes';

const app = express();

// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/emails', emailRoutes);
app.use('/drafts', draftRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────
app.use(globalErrorHandler);

export default app;
