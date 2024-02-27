import {
  getInstructorById,
  getRandomInstructors,
  getInstructorByUsername,
} from '../../Services/instructor.service';
import { InstructorDocument } from '@remus1504/micrograde';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const id = async (req: Request, res: Response): Promise<void> => {
  const seller: InstructorDocument | null = await getInstructorById(
    req.params.sellerId,
  );
  res.status(StatusCodes.OK).json({ message: 'Instructor profile', seller });
};

const username = async (req: Request, res: Response): Promise<void> => {
  const seller: InstructorDocument | null = await getInstructorByUsername(
    req.params.username,
  );
  res.status(StatusCodes.OK).json({ message: 'Instructor profile', seller });
};

const random = async (req: Request, res: Response): Promise<void> => {
  const sellers: InstructorDocument[] = await getRandomInstructors(
    parseInt(req.params.size, 10),
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Random Instructor profile', sellers });
};

export { id, username, random };
