import { Request, Response } from 'express';
import User from '../../models/UserModel.js';

// Step 1: Client asks for a nonce to sign
async function requestNonce(req: Request, res: Response) {
  const walletAddress: string | undefined = req.body?.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const normalizedAddress: string = walletAddress.toLowerCase();

  let user: IUser | null = await User.findOne({
    walletAddress: normalizedAddress,
  });

  if (!user) {
    // TODO: For now I am first creating then again finding user because of typescript error
    user = await User.create({
      walletAddress: normalizedAddress,
    });
  } else {
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();
  }

  // Add a null check for `user` before accessing `user.nonce`
  if (!user) {
    return res.status(500).json({ error: 'User not found after creation' });
  }

  return res.json({ nonce: user.nonce });
}

export default requestNonce;
