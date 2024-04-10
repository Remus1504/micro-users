// Import the necessary modules.
import express, { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import * as studentService from '../../Services/student.service';
import {
  currentUsername,
  email,
} from '../../Controllers/Student/getStudentController';
import { studentDocument } from '@remus1504/micrograde-shared'; // Ensure this import path is correct.

// Initialize the Express application.
const app = express();
app.use(express.json());

// Define mock middleware to set currentUser in the request.
function mockCurrentUser(req: Request, _res: Response, next: NextFunction) {
  // Adding a mock id. Replace 'someMockId' with an appropriate value.
  req.currentUser = {
    id: 1, // This is a new line to include the id.
    email: 'testuser@example.com',
    username: 'testuser',
  };
  next();
}

// Apply the mock middleware to the app.
app.use(mockCurrentUser);

// Define the routes for testing purposes.
app.get('/api/v1/student/email/:email', email);
app.get('/api/v1/student/username/:username', currentUsername);

// Test suite
describe('Student Routes', () => {
  // Mock data based on studentDocument interface.
  const mockStudent: studentDocument = {
    _id: 'someObjectId',
    username: 'testuser',
    email: 'testuser@example.com',
    profilePicture: 'http://example.com/profile.jpg',
    country: 'TestCountry',
    isInstructor: false,
    purchasedCourses: ['course1Id', 'course2Id'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Reset all mocks before each test.
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test case for GET /api/v1/student/email/:email.
  it('should handle GET /api/v1/student/email/:email', async () => {
    jest
      .spyOn(studentService, 'getStudentByEmail')
      .mockResolvedValueOnce(mockStudent);
    const response = await supertest(app).get(
      '/api/v1/student/email/testuser@example.com',
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      message: 'Student profile',
      student: mockStudent,
    });
  });

  // Test case for GET /api/v1/student/username/:username.
  it('should handle GET /api/v1/student/username/:username', async () => {
    jest
      .spyOn(studentService, 'getStudentByUsername')
      .mockResolvedValueOnce(mockStudent);
    const response = await supertest(app).get(
      '/api/v1/student/username/testuser',
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      message: 'Student profile',
      student: mockStudent,
    });
  });
});
