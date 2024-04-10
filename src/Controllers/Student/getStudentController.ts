import {
  getStudentByEmail,
  getStudentByUsername,
} from '../../Services/student.service';
import { studentDocument } from '@remus1504/micrograde-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const email = async (req: Request, res: Response): Promise<void> => {
  const student: studentDocument | null = await getStudentByEmail(
    req.currentUser!.email,
  );
  res.status(StatusCodes.OK).json({ message: 'Student profile', student });
};

const currentUsername = async (req: Request, res: Response): Promise<void> => {
  const student: studentDocument | null = await getStudentByUsername(
    req.currentUser!.username,
  );
  res.status(StatusCodes.OK).json({ message: 'Student profile', student });
};

const username = async (req: Request, res: Response): Promise<void> => {
  const student: studentDocument | null = await getStudentByUsername(
    req.params.username,
  );
  res.status(StatusCodes.OK).json({ message: 'Student profile', student });
};

export { email, username, currentUsername };
