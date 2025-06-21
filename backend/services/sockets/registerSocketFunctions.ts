import { Server, Socket } from 'socket.io';
import handleConnection from './handleConnections.js';

export default function registerSocketFunctions(
  io: Server | undefined,
  socket: Socket
) {
  if (!io) {
    return;
  }
  handleConnection(io, socket);
}
