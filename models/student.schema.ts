import { studentDocument } from '@remus1504/micrograde';
import mongoose, { Model, Schema, model } from 'mongoose';

const StudentSchema: Schema = new Schema(
  {
    username: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    profilePicture: { type: String, required: true },
    country: { type: String, required: true },
    isInstructor: { type: Boolean, default: false },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    createdAt: { type: Date },
  },
  {
    versionKey: false,
  },
);

const studentModel: Model<studentDocument> = model<studentDocument>(
  'Student',
  StudentSchema,
  'Student',
);
export { studentModel };
