import Challenge from '../../models/ChallengeModel.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import Duels from '../../models/DuelsModel.js';
import { createClient } from 'redis';
import { getSocketInstance } from '../../utils/socketHandler.js';
import { Server } from 'socket.io';

const searchOpponent: fn = catchAsync(async (req: any, res: any) => {
  const client: ReturnType<typeof createClient> = createClient();
  client
    .connect()
    .then((data: any) => {
      console.log(data);
      console.log('Connected to Redis');
    })
    .catch((err: Error) => {
      console.error('Error connecting to Redis:', err);
    });

  const response: APIResponse = {
    message: 'Searching for an opponent',
    status: 'success',
    statusCode: 200,
    success: true,
    details: {
      title: 'Searching for Opponent',
      description: 'We are looking for an opponent for you.',
      context: {
        1: 'User is searching for an opponent',
        2: 'This will create a duel in Redis if no opponent is found',
      },
    },
  };

  const userId: string | undefined = req.user?.id;
  const challengeId: string | undefined = req.body?.challengeId;
  if (!userId || !challengeId) {
    response.message = 'User ID and Challenge ID are required';
    response.statusCode = 400;
    response.success = false;
    response.details = {
      title: 'Missing Parameters',
      description:
        'User ID and Challenge ID are required to search for an opponent.',
      context: {
        1: 'User ID or Challenge ID is not provided',
        2: 'Client did not provide necessary parameters for duel creation',
      },
    };
    return sendResponse(res, response);
  }

  // Search for challenge ID if available
  const challenge: IChallenge | null = await Challenge.findById(challengeId);
  if (!challenge) {
    response.message = 'Challenge not found';
    response.statusCode = 404;
    response.success = false;
    response.details = {
      title: 'Challenge Not Found',
      description: 'The challenge you are trying to join does not exist.',
      context: {
        1: `Challenge ID ${challengeId} does not exist in the database`,
        2: 'Client tried to join a non-existing challenge',
      },
    };
    return sendResponse(res, response);
  }

  // search for an existing duel in MongoDB with the same challenge
  const existingDuel: IDuels | null = await Duels.findOne({
    challenge: challengeId,
    status: 'searching',
    user2: null, // Looking for a duel that is still searching for an opponent
  });
  if (existingDuel) {
    // If an existing duel is found, add the user as the second participant
    existingDuel.user2 = userId;
    existingDuel.status = 'confirming'; // Update status to in-progress
    existingDuel.updatedAt = new Date();
    await existingDuel.save();

    // Store the updated duel in Redis
    await client.set(`duel:${existingDuel._id}`, JSON.stringify(existingDuel));

    response.data = existingDuel;
    response.message = 'Opponent found, duel is now in progress';
    response.statusCode = 200;
    response.success = true;
    response.details = {
      title: 'Opponent Found',
      description:
        'An opponent has been found and the duel is now in progress.',
      context: {
        1: `Duel ID ${existingDuel._id} updated with opponent`,
        2: 'Client can now proceed with the duel',
      },
    };

    // Notify both users to join the room
    const io: Server = getSocketInstance();
    io.to(existingDuel.user1 as string).emit('joinRoom', {
      roomId: existingDuel._id,
    });
    io.to(userId).emit('joinRoom', { roomId: existingDuel._id });

    return sendResponse(res, response);
  }

  // else create a new duel in Redis
  const redisDuel: Partial<IDuels> = {
    user1: userId,
    user2: null, // Initially no opponent
    challenge: challengeId,
    status: 'searching',
    createdAt: new Date(),
    updatedAt: new Date(),
    winner: null,
  };
  const duel: IDuels = await Duels.insertOne(redisDuel);
  if (!duel) {
    response.message = 'Failed to create duel';
    response.statusCode = 500;
    response.success = false;
    response.details = {
      title: 'Duel Creation Failed',
      description: 'There was an error creating the duel in Redis.',
      context: {
        1: 'Redis or database error occurred while creating the duel',
        2: 'Client tried to create a duel but it failed',
      },
    };
    return sendResponse(res, response);
  }

  // Notify the user to join the room
  const io: Server = getSocketInstance();
  io.to(userId).emit('joinRoom', { roomId: duel._id });

  // Store the duel in Redis
  await client.set(`duel:${duel._id}`, JSON.stringify(redisDuel));
  console.log(`Key duel:${duel._id} added to Redis`);
  const finalDuel: IDuels | null = await Duels.findById(duel._id)
    .select('-__v -createdAt -updatedAt')
    .populate('challenge');
  if (!finalDuel) {
    response.message = 'Failed to retrieve duel from database';
    response.statusCode = 500;
    response.success = false;
    response.details = {
      title: 'Duel Retrieval Failed',
      description: 'There was an error retrieving the duel from the database.',
      context: {
        1: 'Database error occurred while retrieving the duel',
        2: 'Client tried to retrieve a duel but it failed',
      },
    };
    return sendResponse(res, response);
  }

  response.data = finalDuel;
  response.message = 'Duel created successfully, waiting for an opponent';
  response.statusCode = 201;
  response.success = true;
  response.details = {
    title: 'Duel Created',
    description: 'A duel has been created and is waiting for an opponent.',
    context: {
      1: `Duel ID ${duel._id} created in Redis`,
      2: 'Client can now wait for an opponent to join the duel',
    },
  };

  res.status(201).json({ message: 'Duel created successfully' });
});

export default searchOpponent;
