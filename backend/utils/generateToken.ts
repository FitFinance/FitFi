import jwt, { Secret } from 'jsonwebtoken';
import { Request } from 'express';

function generateToken(userId: string, req: Request): string | void {
  const SECRET: string = (req as any).envs.JWT_SECRET;
  const TTL: string = (req as any).envs.JWT_TTL;

  // TODO: Unsafe code, check why TTL is not being taken as string input
  return jwt.sign({ userId }, SECRET as Secret, {
    expiresIn: TTL as any,
  });
}

export default generateToken;
