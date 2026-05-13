import { Router, Request, Response, NextFunction } from 'express';
import {
  getAppSettings,
  enableAutoDraft,
  disableAutoDraft,
} from '../settings/settingsService';

const router = Router();

/**
 * GET /settings
 * Returns current application settings.
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await getAppSettings();
    res.json({ success: true, data: { autoDraftEnabled: settings.autoDraftEnabled } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /settings/auto-draft/start
 * Enables automatic draft generation.
 */
router.post('/auto-draft/start', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await enableAutoDraft();
    res.json({ success: true, data: result, message: 'Auto-draft enabled' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /settings/auto-draft/stop
 * Disables automatic draft generation.
 */
router.post('/auto-draft/stop', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await disableAutoDraft();
    res.json({ success: true, data: result, message: 'Auto-draft disabled' });
  } catch (err) {
    next(err);
  }
});

export default router;
