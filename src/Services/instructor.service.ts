import { InstructorModel } from '../models/instructor.schema';
import {
  IEnrolmentMessage,
  IRatingTypes,
  IReviewMessageDetails,
  InstructorDocument,
} from '@remus1504/micrograde-shared';
import mongoose from 'mongoose';
import { updateStudentIsInstructorProp } from './student.service';

const getInstructorById = async (
  instructorId: string,
): Promise<InstructorDocument | null> => {
  const instructor: InstructorDocument | null = (await InstructorModel.findOne({
    _id: new mongoose.Types.ObjectId(instructorId),
  }).exec()) as InstructorDocument;
  return instructor;
};

const getInstructorByUsername = async (
  username: string,
): Promise<InstructorDocument | null> => {
  const instructor: InstructorDocument | null = (await InstructorModel.findOne({
    username,
  }).exec()) as InstructorDocument;
  return instructor;
};

const getInstructorByEmail = async (
  email: string,
): Promise<InstructorDocument | null> => {
  const instructor: InstructorDocument | null = (await InstructorModel.findOne({
    email,
  }).exec()) as InstructorDocument;
  return instructor;
};

const getRandomInstructors = async (
  size: number,
): Promise<InstructorDocument[]> => {
  const instructors: InstructorDocument[] = await InstructorModel.aggregate([
    { $sample: { size } },
  ]);
  return instructors;
};

const createInstructor = async (
  instructorData: InstructorDocument,
): Promise<InstructorDocument> => {
  const createdInstructor: InstructorDocument = (await InstructorModel.create(
    instructorData,
  )) as InstructorDocument;
  await updateStudentIsInstructorProp(`${createdInstructor.email}`);
  return createdInstructor;
};

const updateInstructor = async (
  instructorId: string,
  instructorData: InstructorDocument,
): Promise<InstructorDocument> => {
  const updatedInstructor: InstructorDocument =
    (await InstructorModel.findOneAndUpdate(
      { _id: instructorId },
      {
        $set: {
          profilePublicId: instructorData.profilePublicId,
          fullName: instructorData.fullName,
          profilePicture: instructorData.profilePicture,
          description: instructorData.description,
          country: instructorData.country,
          skills: instructorData.skills,
          oneliner: instructorData.oneliner,
          languages: instructorData.languages,
          responseTime: instructorData.responseTime,
          experience: instructorData.experience,
          education: instructorData.education,
          socialLinks: instructorData.socialLinks,
          certificates: instructorData.certificates,
        },
      },
      { new: true },
    ).exec()) as InstructorDocument;
  return updatedInstructor;
};

const updateTotalCourseCount = async (
  instructorId: string,
  count: number,
): Promise<void> => {
  await InstructorModel.updateOne(
    { _id: instructorId },
    { $inc: { totalCourses: count } },
  ).exec();
};

const updateInstructorOngoingJobsProp = async (
  instructorId: string,
  onGoingTasks: number,
): Promise<void> => {
  await InstructorModel.updateOne(
    { _id: instructorId },
    { $inc: { onGoingTasks } },
  ).exec();
};

const updateInstructorCancelledJobsProp = async (
  instructorId: string,
): Promise<void> => {
  await InstructorModel.updateOne(
    { _id: instructorId },
    { $inc: { onGoingTasks: -1, cancelledTasks: 1 } },
  ).exec();
};

const updateInstructorCompletedJobsProp = async (
  data: IEnrolmentMessage,
): Promise<void> => {
  const {
    instructorId,
    onGoingTasks,
    completedTasks,
    totalEarnings,
    recentDelivery,
  } = data;
  await InstructorModel.updateOne(
    { _id: instructorId },
    {
      $inc: {
        onGoingTasks,
        completedTasks,
        totalEarnings,
      },
      $set: { recentDelivery: new Date(recentDelivery!) },
    },
  ).exec();
};

const updateInstructorReview = async (
  data: IReviewMessageDetails,
): Promise<void> => {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
  };
  const ratingKey: string = ratingTypes[`${data.rating}`];
  await InstructorModel.updateOne(
    { _id: data.instructorId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1,
      },
    },
  ).exec();
};

export {
  getInstructorById,
  getInstructorByUsername,
  getInstructorByEmail,
  getRandomInstructors,
  createInstructor,
  updateInstructor,
  updateTotalCourseCount,
  updateInstructorOngoingJobsProp,
  updateInstructorCompletedJobsProp,
  updateInstructorReview,
  updateInstructorCancelledJobsProp,
};
