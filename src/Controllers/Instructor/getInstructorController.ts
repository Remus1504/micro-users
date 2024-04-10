import {
  getInstructorById,
  getRandomInstructors,
  getInstructorByUsername,
} from '../../Services/instructor.service';
import { InstructorDocument } from '@remus1504/micrograde-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const id = async (req: Request, res: Response): Promise<void> => {
  const instructor: InstructorDocument | null = await getInstructorById(
    req.params.instructorId,
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Instructor profile', instructor });
};

const username = async (req: Request, res: Response): Promise<void> => {
  const instructor: InstructorDocument | null = await getInstructorByUsername(
    req.params.username,
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Instructor profile', instructor });
};

const random = async (req: Request, res: Response): Promise<void> => {
  const instructors: InstructorDocument[] = await getRandomInstructors(
    parseInt(req.params.size, 10),
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Random Instructor profile', instructors });
};

export { id, username, random };
