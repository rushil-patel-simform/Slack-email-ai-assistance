import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import healthRoutes from './routes/healthRoutes';
import draftRoutes from './routes/draftRoutes';
import settingsRoutes from './routes/settingsRoutes';
import generateDraftRoute from './routes/generateDraftRoute';

const app = express();

// ── CORS ──────────────────────────────────────────────────────
// Allow Chrome extension content scripts (from mail.google.com or
// chrome-extension:// origins) to call the backend.
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) and any
    // chrome-extension://* or https://mail.google.com origin.
    if (
      !origin ||
      origin.startsWith('chrome-extension://') ||
      origin === 'https://mail.google.com' ||
      origin === 'http://localhost:3000'
    ) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for local dev
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
app.use('/settings', settingsRoutes);
app.use('/generate-draft', generateDraftRoute);

// ── 404 Handler ───────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────
app.use(globalErrorHandler);

export default app;
