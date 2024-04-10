import { InstructorSchema } from '../../Schemas/instructor.schemea';
import {
  createInstructor,
  getInstructorByEmail,
} from '../../Services/instructor.service';
import {
  BadRequestError,
  InstructorDocument,
} from '@remus1504/micrograde-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const Instructor = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(InstructorSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Create Instructor() method error',
    );
  }
  const checkIfInstructorExist: InstructorDocument | null =
    await getInstructorByEmail(req.body.email);
  if (checkIfInstructorExist) {
    throw new BadRequestError(
      'Instructor already exist. Go to your account page to update.',
      'Create Instructor() method error',
    );
  }
  const Instructor: InstructorDocument = {
    profilePublicId: req.body.profilePublicId,
    fullName: req.body.fullName,
    username: req.currentUser!.username,
    email: req.body.email,
    profilePicture: req.body.profilePicture,
    description: req.body.description,
    oneliner: req.body.oneliner,
    country: req.body.country,
    skills: req.body.skills,
    languages: req.body.languages,
    responseTime: req.body.responseTime,
    experience: req.body.experience,
    education: req.body.education,
    socialLinks: req.body.socialLinks,
    certificates: req.body.certificates,
  };
  const createdInstructor: InstructorDocument =
    await createInstructor(Instructor);
  console.log('HIT');
  console.log(createdInstructor);
  res.status(StatusCodes.CREATED).json({
    message: 'Instructor created successfully.',
    instructor: createdInstructor,
  });
};

export { Instructor };
