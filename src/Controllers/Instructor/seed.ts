import { faker } from '@faker-js/faker';
import {
  BadRequestError,
  studentDocument,
  IEducation,
  IExperience,
  InstructorDocument,
} from '@remus1504/micrograde-shared';
import { floor, random, sample, sampleSize } from 'lodash';
import { Request, Response } from 'express';
import { getRandomStudents } from '../../Services/student.service';
import {
  createInstructor,
  getInstructorByEmail,
} from '../../Services/instructor.service';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';

const seed = async (req: Request, res: Response): Promise<void> => {
  const { count } = req.params;
  const students: studentDocument[] = await getRandomStudents(
    parseInt(count, 10),
  );
  for (let i = 0; i < students.length; i++) {
    const student: studentDocument = students[i];
    const checkIfInstructorExist: InstructorDocument | null =
      await getInstructorByEmail(`${student.email}`);
    if (checkIfInstructorExist) {
      throw new BadRequestError(
        'Instructor already exist.',
        'InstructorSeed instructor() method error',
      );
    }
    const basicDescription: string = faker.commerce.productDescription();
    const skills: string[] = [
      'Mathematics',
      'Chemistry',
      'Computer Science',
      'Chemsistry',
      'Geography',
      'Business',
      'Music',
      'Religious Education',
    ];
    const instructor: InstructorDocument = {
      profilePublicId: uuidv4(),
      fullName: faker.person.fullName(),
      username: student.username,
      email: student.email,
      country: faker.location.country(),
      profilePicture: student.profilePicture,
      description:
        basicDescription.length <= 250
          ? basicDescription
          : basicDescription.slice(0, 250),
      oneliner: faker.word.words({ count: { min: 5, max: 10 } }),
      skills: sampleSize(skills, sample([1, 4])),
      languages: [
        { language: 'English', level: 'Native' },
        { language: 'Spnish', level: 'Basic' },
        { language: 'German', level: 'Basic' },
      ],
      responseTime: parseInt(faker.commerce.price({ min: 1, max: 5, dec: 0 })),
      experience: randomExperiences(
        parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 })),
      ),
      education: randomEducation(
        parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 })),
      ),
      socialLinks: [
        'https://kickchatapp.com',
        'http://youtube.com',
        'https://facebook.com',
      ],
      certificates: [
        {
          name: 'Flutter App Developer',
          from: 'Flutter Academy',
          year: 2021,
        },
        {
          name: 'Android App Developer',
          from: '2019',
          year: 2020,
        },
        {
          name: 'IOS App Developer',
          from: 'Apple Inc.',
          year: 2019,
        },
      ],
    };
    await createInstructor(instructor);
  }
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Instructors created successfully' });
};

const randomExperiences = (count: number): IExperience[] => {
  const result: IExperience[] = [];
  for (let i = 0; i < count; i++) {
    const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025];
    const randomEndYear = ['Present', '2024', '2025', '2026', '2027'];
    const endYear = randomEndYear[floor(random(0.9) * randomEndYear.length)];
    const experience = {
      company: faker.company.name(),
      title: faker.person.jobTitle(),
      startDate: `${faker.date.month()} ${randomStartYear[floor(random(0.9) * randomStartYear.length)]}`,
      endDate:
        endYear === 'Present' ? 'Present' : `${faker.date.month()} ${endYear}`,
      description: faker.commerce.productDescription().slice(0, 100),
      currentlyWorkingHere: endYear === 'Present',
    };
    result.push(experience);
  }
  return result;
};

const randomEducation = (count: number): IEducation[] => {
  const result: IEducation[] = [];
  for (let i = 0; i < count; i++) {
    const randomYear = [2020, 2021, 2022, 2023, 2024, 2025];
    const education = {
      country: faker.location.country(),
      university: faker.person.jobTitle(),
      title: faker.person.jobTitle(),
      major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
      year: `${randomYear[floor(random(0.9) * randomYear.length)]}`,
    };
    result.push(education);
  }
  return result;
};

export { seed };
