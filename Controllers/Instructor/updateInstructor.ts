import { InstructorSchema } from '../../Schemas/instructor.schemea';
import { updateInstructor } from '../../Services/instructor.service';
import { BadRequestError, InstructorDocument } from '@remus1504/micrograde';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const instructor = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(InstructorSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Update seller() method error',
    );
  }
  const instructor: InstructorDocument = {
    profilePublicId: req.body.profilePublicId,
    fullName: req.body.fullName,
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
  const updatedInstructor: InstructorDocument = await updateInstructor(
    req.params.sellerId,
    instructor,
  );
  res
    .status(StatusCodes.OK)
    .json({
      message: 'Seller created successfully.',
      instructor: updatedInstructor,
    });
};

export { instructor };
