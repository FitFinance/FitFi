import chalk from 'chalk';
import { Socket, Server } from 'socket.io';
import User from '../../models/UserModel.js';
import getRedisClient from '../redis/index.js';
import { RedisClientType } from 'redis';
import catchAsyncSockets from '../../utils/catchAsyncSockets.js';

const handleConnection: socketFn = catchAsyncSockets(
  async (_: Server, socket: Socket) => {
    const userId: string | string[] | undefined = socket.handshake.query.userId;
    const redis: RedisClientType<any, any> = await getRedisClient();

    console.log(
      chalk.bgYellow(' SOCKETS '),
      `Socket with socket ID: ${chalk.bgBlue.white(
        socket.id
      )} connected, userId: ${chalk.green(userId)}`
    );

    if (!userId) {
      console.log('User ID not found');
      socket.emit('error', { message: 'User ID is required' });
      socket.disconnect(true);
      return;
    }

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      console.log('User not found');

      socket.emit('error', { message: 'Invalid User ID sent' });
      socket.disconnect(true);
      return;
    }

    await redis.set(userId as string, socket.id);
    socket.emit('success', {
      message: 'You were added to Redis DB',
      socket: socket.id,
    });
  }
);

export default handleConnection;
