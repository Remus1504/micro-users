import { email, currentUsername, username } from '../Controllers/Student/getStudentController';
import express, { Router } from 'express';

const router: Router = express.Router();

const StudentRoutes = (): Router => {
  router.get('/email', email);
  router.get('/username', currentUsername);
  router.get('/:username', username);

  return router;
};

export { StudentRoutes };