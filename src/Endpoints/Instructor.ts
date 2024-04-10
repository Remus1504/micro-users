import { Instructor as createInstructor } from '../Controllers/Instructor/createInstructorController';
import {
  id,
  random,
  username,
} from '../Controllers/Instructor/getInstructorController';
import { seed } from '../Controllers/Instructor/seed';
import { instructor as updateInstructor } from '../Controllers/Instructor/updateInstructor';
import express, { Router } from 'express';

const router: Router = express.Router();

const InstructorRoutes = (): Router => {
  router.get('/id/:instructorId', id);
  router.get('/username/:username', username);
  router.get('/random/:size', random);
  router.post('/create', createInstructor);
  router.put('/:instructorId', updateInstructor);
  router.put('/seed/:count', seed);

  return router;
};

export { InstructorRoutes };
