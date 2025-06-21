import chalk from 'chalk';
import { Server as HTTPServer } from 'node:http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | undefined;

function initiateSocket(httpServer: HTTPServer): void {
  try {
    if (io) {
      console.log(chalk.yellow('INFO:'), 'Socket is already initiated');
      return;
    }
    io = new SocketServer(httpServer);
    io.on('connection', (socket: Socket) => {
      console.log(
        `Socket with socket ID: ${chalk.bgBlue(socket.id)} connected`
      );
    });
    console.log(
      chalk.bgYellow(' SOCKETS '),
      chalk.magenta('Socket was initiated successfully')
    );
  } catch (err: any) {
    console.log(
      chalk.red('ERROR: '),
      'Some error occured in initiating sockets'
    );
  }
}

function getIO(): SocketServer {
  if (!io) throw new Error('First initiate the IO server');
  return io;
}

export { initiateSocket, getIO };
