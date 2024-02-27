import http from 'http';
import 'express-async-errors';
import {
  CustomError,
  IAuthPayload,
  IErrorResponse,
  winstonLogger,
} from '@remus1504/micrograde';
import { Logger } from 'winston';
import { config } from './configuration';
import {
  Application,
  Request,
  Response,
  NextFunction,
  json,
  urlencoded,
} from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from './elasticsearch';
import { endPoints } from './endpoints';
import {
  consumeInstructorDirectMessage,
  consumeReviewFanoutMessages,
  consumeSeedCourseDirectMessages,
  consumeStudentDirectMessage,
} from 'Queues/user.consumer';
import { Channel } from 'amqplib';
import { createConnection } from 'Queues/connection';

const NEW_SERVER_PORT = 4003;
const newLogger: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'userServer',
  'debug',
);

const start = (newApp: Application): void => {
  newSecurityMiddleware(newApp);
  newStandardMiddleware(newApp);
  newRoutesMiddleware(newApp);
  startQueues();
  startElasticSearch();
  userErrorHandler(newApp);
  startNewServer(newApp);
};

const newSecurityMiddleware = (newApp: Application): void => {
  newApp.set('trust proxy', 1);
  newApp.use(hpp());
  newApp.use(helmet());
  newApp.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );
  newApp.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(
        token,
        config.JWT_TOKEN!,
      ) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const newStandardMiddleware = (newApp: Application): void => {
  newApp.use(compression());
  newApp.use(json({ limit: '200mb' }));
  newApp.use(urlencoded({ extended: true, limit: '200mb' }));
};

const newRoutesMiddleware = (newApp: Application): void => {
  endPoints(newApp);
};

const startQueues = async (): Promise<void> => {
  const userChannel: Channel = (await createConnection()) as Channel;
  consumeStudentDirectMessage(userChannel);
  consumeInstructorDirectMessage(userChannel);
  consumeReviewFanoutMessages(userChannel);
  consumeSeedCourseDirectMessages(userChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
};

const userErrorHandler = (newApp: Application): void => {
  newApp.use(
    (
      error: IErrorResponse,
      _req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      newLogger.log('error', `userService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    },
  );
};

const startNewServer = (newApp: Application): void => {
  try {
    const newHttpServer: http.Server = new http.Server(newApp);
    newLogger.info(`User server has started with process id ${process.pid}`);
    newHttpServer.listen(NEW_SERVER_PORT, () => {
      newLogger.info(`User server running on port ${NEW_SERVER_PORT}`);
    });
  } catch (error) {
    newLogger.log('error', 'UsersService startServer() method error:', error);
  }
};

export { start };
