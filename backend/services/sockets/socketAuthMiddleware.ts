import { Socket, ExtendedError } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../../models/UserModel.js';

/**
 * Socket.io middleware for authenticating JWT and attaching userId to socket
 */
export default async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token: string | string[] | undefined = socket.handshake.query.token;
    if (!token || typeof token !== 'string') {
      return next({
        message: 'Token is required or invalid',
        data: null,
      } as any);
    }
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return next({ message: 'Invalid or malformed token', data: null } as any);
    }
    if (typeof decoded === 'string' || !decoded.userId) {
      return next({ message: 'Invalid Token sent', data: null } as any);
    }
    // Check user exists
    const user: IUser | null = await User.findById(decoded?.userId);
    if (!user) {
      return next({
        message:
          'Security Alert: Tampered JWT detected. Continued misuse may lead to a permanent ban',
        data: null,
      } as any);
    }
    // Attach userId to socket
    (socket as any).userId = decoded.userId;
    next();
  } catch (err) {
    next({ message: 'Socket authentication error', data: null } as any);
  }
}
