import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeSocket: (httpServer: HttpServer) => void = (
  httpServer: HttpServer
): void => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust this to your frontend's URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};

export const getSocketInstance: () => Server = () => {
  if (!io) {
    throw new Error(
      'Socket.io instance is not initialized. Call initializeSocket first.'
    );
  }
  return io;
};
