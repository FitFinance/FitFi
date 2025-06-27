import chalk from 'chalk';
import { Server, Socket } from 'socket.io';

function catchAsyncSockets(fn: socketFn): socketFn {
  return function (io: Server, socket: Socket) {
    try {
      Promise.resolve()
        .then(() => fn(io, socket))
        .catch((err: unknown) => {
          handleAsyncError(err, socket);
        });
    } catch (err: unknown) {
      handleSyncError(err, socket);
    }
  };
}

function handleAsyncError(err: unknown, socket: Socket): void {
  console.error(chalk.bgRed('ERROR'), 'Async error in socket function:', err);
  const errorMessage: string =
    typeof err === 'object' && err !== null && 'message' in err
      ? (err as any).message
      : 'An unexpected error occurred';
  socket.emit('error', errorMessage);
  setTimeout(() => socket.disconnect(), 100); // Ensure error is sent before disconnecting
}

function handleSyncError(err: unknown, socket: Socket): void {
  console.error(
    chalk.bgRed('ERROR'),
    'Synchronous error in socket function:',
    err
  );
  socket.emit('error', 'An unexpected error occurred');
}

export default catchAsyncSockets;
