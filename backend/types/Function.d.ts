import { NextFunction, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

declare global {
  type fn = (req: Request, res: Response, next: NextFunction) => any;
  type socketFn = (io: Server, socket: Socket) => any;
}
