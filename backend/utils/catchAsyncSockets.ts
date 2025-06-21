import chalk from 'chalk';
import { Server, Socket } from 'socket.io';

function catchAsyncSockets(fn: socketFn): socketFn {
  return function (io: Server, socket: Socket) {
    try {
      Promise.resolve()
        .then(() => fn(io, socket))
        .catch((err: unknown) => {
          console.error(
            chalk.bgRed('ERROR'),
            'Async error in socket function:'
          );
          socket.emit('error', 'An unexpected error occurred');
        });
    } catch (err: unknown) {
      console.error(
        chalk.bgRed('ERROR'),
        'Synchronous error in socket function:'
      );
      socket.emit('error', 'An unexpected error occurred');
    }
  };
}
export default catchAsyncSockets;
