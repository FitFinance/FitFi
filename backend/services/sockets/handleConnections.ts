import chalk from 'chalk';
import { Socket, Server } from 'socket.io';
import getRedisClient from '../redis/index.js';
import { RedisClientType } from 'redis';
import catchAsyncSockets from '../../utils/catchAsyncSockets.js';

// const handleConnection: socketFn = catchAsyncSockets(
//   async (_: Server, socket: Socket) => {
//     const userId: string | string[] | undefined = socket.handshake.query.userId;
//     const redis: RedisClientType<any, any> = await getRedisClient();

//     console.log(
//       chalk.bgYellow(' SOCKETS '),
//       `Socket with socket ID: ${chalk.bgBlue.white(
//         socket.id
//       )} connected, userId: ${chalk.green(userId)}`
//     );

//     if (!userId) {
//       console.log('User ID not found');
//       socket.emit('error', { message: 'User ID is required' });
//       socket.disconnect(true);
//       return;
//     }

//     const user: IUser | null = await User.findById(userId);
//     if (!user) {
//       console.log('User not found');

//       socket.emit('error', { message: 'Invalid User ID sent' });
//       socket.disconnect(true);
//       return;
//     }

//     await redis.set(userId as string, socket.id);
//     socket.emit('success', {
//       message: 'You were added to Redis DB',
//       socket: socket.id,
//     });
//   }
// );

// HandleConnection implementation: expects userId to be attached to socket by io.use middleware
const handleConnection: socketFn = catchAsyncSockets(
  async (_: Server, socket: Socket) => {
    const redis: RedisClientType<any, any> = await getRedisClient();
    const userId: string | undefined = (socket as any).userId;

    console.log(
      chalk.bgYellow(' SOCKETS '),
      `Socket with socket ID: ${chalk.bgBlue.white(
        socket.id
      )} connected, userId: ${chalk.green(userId)}`
    );

    if (!userId) {
      socket.emit('error', { message: 'User ID not found on socket' });
      socket.disconnect(true);
      return;
    }

    await redis.set(userId, socket.id);
    socket.emit('success', {
      message: 'You were added to Redis DB',
      socket: socket.id,
    });
  }
);

export default handleConnection;
