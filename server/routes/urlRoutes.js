import { Router } from 'express';
import { batchLimiter, shortenLimiter } from '../middleware/rateLimiter.js';

export function createUrlRoutes(controller) {
  const router = Router();
  router.post('/shorten', shortenLimiter, controller.shorten);
  router.post('/batch', batchLimiter, controller.batch);
  router.get('/analytics/:shortCode', controller.analytics);
  return router;
}
