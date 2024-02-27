import { config } from '../src/configuration';
import {
  InstructorDocument,
  studentDocument,
  winstonLogger,
} from '@remus1504/micrograde';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '../Queues/connection';
import {
  createStudent,
  updateStudentEnrolledInCourseProp,
} from '../Services/student.service';
import {
  getRandomInstructors,
  updateTotalCourseCount,
  updateInstructorOngoingJobsProp,
  updateInstructorCompletedJobsProp,
  updateInstructorReview,
  updateInstructorCancelledJobsProp,
} from '../Services/instructor.service';
import { publishDirectMessage } from '../Queues/user.producer';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'usersServiceConsumer',
  'debug',
);

const consumeStudentDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-student-update';
    const routingKey = 'user-student';
    const queueName = 'user-student-queue';
    await channel.assertExchange(exchangeName, 'direct'); // exhange type is direct
    const microGradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false },
    ); // checks if the queue exsists if not it creates it
    await channel.bindQueue(microGradeQueue.queue, exchangeName, routingKey); // binds the exchange to the queue
    channel.consume(
      microGradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString());
        if (type === 'auth') {
          const { username, email, profilePicture, country, createdAt } =
            JSON.parse(msg!.content.toString());
          const student: studentDocument = {
            username,
            email,
            profilePicture,
            country,
            enrolledCourses: [],
            createdAt,
          }; // subscribing to the queue to cosume the message returned
          await createStudent(student);
        } else {
          const { InstructorId, enrolledCourses } = JSON.parse(
            msg!.content.toString(),
          );
          await updateStudentEnrolledInCourseProp(
            InstructorId,
            enrolledCourses,
            type,
          );
        }
        channel.ack(msg!); // check to see if the message was ackowledged
      },
    );
  } catch (error) {
    log.log(
      'error',
      'UsersService UserConsumer consumeStudentDirectMessage() method error:',
      error,
    );
  }
};

const consumeInstructorDirectMessage = async (
  channel: Channel,
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-instructor-update';
    const routingKey = 'user-instructor';
    const queueName = 'user-instructor-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const microGradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false },
    );
    await channel.bindQueue(microGradeQueue.queue, exchangeName, routingKey);
    channel.consume(
      microGradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const {
          type,
          instructorId,
          ongoingJobs,
          completedJobs,
          totalEarnings,
          recentDelivery,
          gigSellerId,
          count,
        } = JSON.parse(msg!.content.toString());
        if (type === 'create-order') {
          await updateInstructorOngoingJobsProp(instructorId, ongoingJobs);
        } else if (type === 'approve-order') {
          await updateInstructorCompletedJobsProp({
            instructorId,
            ongoingJobs,
            completedJobs,
            totalEarnings,
            recentDelivery,
          });
        } else if (type === 'update-course-count') {
          await updateTotalCourseCount(`${gigSellerId}`, count);
        } else if (type === 'cancel-order') {
          await updateInstructorCancelledJobsProp(instructorId);
        }
        channel.ack(msg!);
      },
    );
  } catch (error) {
    log.log(
      'error',
      'UsersService UserConsumer consumeSellerDirectMessage() method error:',
      error,
    );
  }
};

const consumeReviewFanoutMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-review';
    const queueName = 'instructor-review-queue';
    await channel.assertExchange(exchangeName, 'fanout');
    const microGradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false },
    );
    await channel.bindQueue(microGradeQueue.queue, exchangeName, '');
    channel.consume(
      microGradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString());
        if (type === 'student-review') {
          await updateInstructorReview(JSON.parse(msg!.content.toString()));
          await publishDirectMessage(
            channel,
            'micrograde-update-course',
            'update-course',
            JSON.stringify({
              type: 'updateCourse',
              courseReview: msg!.content.toString(),
            }),
            'Message sent to course service.',
          );
        }
        channel.ack(msg!);
      },
    );
  } catch (error) {
    log.log(
      'error',
      'UsersService UserConsumer consumeReviewFanoutMessages() method error:',
      error,
    );
  }
};

const consumeSeedCourseDirectMessages = async (
  channel: Channel,
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-course';
    const routingKey = 'get-instructrors';
    const queueName = 'user-course-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const microGradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false },
    );
    await channel.bindQueue(microGradeQueue.queue, exchangeName, routingKey);
    channel.consume(
      microGradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString());
        if (type === 'getinstructors') {
          const { count } = JSON.parse(msg!.content.toString());
          const instructors: InstructorDocument[] = await getRandomInstructors(
            parseInt(count, 10),
          );
          await publishDirectMessage(
            channel,
            'micrograde-seed-course',
            'receive-instructors',
            JSON.stringify({ type: 'receiveInstructors', instructors, count }),
            'Message sent to course service.',
          );
        }
        channel.ack(msg!);
      },
    );
  } catch (error) {
    log.log(
      'error',
      'UsersService UserConsumer consumeReviewFanoutMessages() method error:',
      error,
    );
  }
};

export {
  consumeStudentDirectMessage,
  consumeInstructorDirectMessage,
  consumeReviewFanoutMessages,
  consumeSeedCourseDirectMessages,
};
