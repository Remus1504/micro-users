import { Application } from 'express';
import { verifyGatewayRequest } from '@remus1504/micrograde';
import { healthRoutes } from 'Endpoints/Health';
const STUDENT_BASE_PATH = '/api/v1/student';
const INSTRUCTOR_BASE_PATH = '/api/vi/instructor';

const endPoints = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(STUDENT_BASE_PATH, verifyGatewayRequest);
  app.use(INSTRUCTOR_BASE_PATH, verifyGatewayRequest);
};

export { endPoints };
