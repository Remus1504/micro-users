import { Application } from 'express';
import { verifyGatewayRequest } from '@remus1504/micrograde-shared';
import { healthRoutes } from './Endpoints/Health';
import { StudentRoutes } from './Endpoints/Student';
import { InstructorRoutes } from './Endpoints/Instructor';

const STUDENT_BASE_PATH = '/api/v1/student';

const INSTRUCTOR_BASE_PATH = '/api/v1/instructor';

const endPoints = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(STUDENT_BASE_PATH, verifyGatewayRequest, StudentRoutes());
  app.use(INSTRUCTOR_BASE_PATH, verifyGatewayRequest, InstructorRoutes());
};

export { endPoints, StudentRoutes };
