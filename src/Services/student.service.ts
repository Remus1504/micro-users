import { studentModel } from '../models/student.schema';
import { studentDocument } from '@remus1504/micrograde-shared';

const getStudentByEmail = async (
  email: string,
): Promise<studentDocument | null> => {
  const student: studentDocument | null = (await studentModel
    .findOne({
      email,
    })
    .exec()) as studentDocument;
  return student;
};

const getStudentByUsername = async (
  username: string,
): Promise<studentDocument | null> => {
  const student: studentDocument | null = (await studentModel
    .findOne({
      username,
    })
    .exec()) as studentDocument;
  return student;
};

const getRandomStudents = async (count: number): Promise<studentDocument[]> => {
  const randomStudents: studentDocument[] = await studentModel.aggregate([
    { $sample: { size: count } },
  ]);
  return randomStudents;
};

const createStudent = async (studentData: studentDocument): Promise<void> => {
  const checkIfStudentExist: studentDocument | null = await getStudentByEmail(
    `${studentData.email}`,
  );
  if (!checkIfStudentExist) {
    await studentModel.create(studentData);
  }
};

const updateStudentIsInstructorProp = async (email: string): Promise<void> => {
  await studentModel
    .updateOne(
      { email },
      {
        $set: {
          isInstructor: true,
        },
      },
    )
    .exec();
};

const updateStudentEnrolledInCourseProp = async (
  studentId: string,
  enrolledCourseId: string,
  type: string,
): Promise<void> => {
  await studentModel
    .updateOne(
      { _id: studentId },
      type === 'purchased-courses'
        ? {
            $push: {
              purchasedCourses: enrolledCourseId,
            },
          }
        : {
            $pull: {
              purchasedCourses: enrolledCourseId,
            },
          },
    )
    .exec();
};

export {
  getStudentByEmail,
  getStudentByUsername,
  getRandomStudents,
  createStudent,
  updateStudentIsInstructorProp,
  updateStudentEnrolledInCourseProp,
};
