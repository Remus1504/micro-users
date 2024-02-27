import { health } from '../Controllers/health';
import express, { Router } from 'express';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/auth-health', health);

  return router;
}
