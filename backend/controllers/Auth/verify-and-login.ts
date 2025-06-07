import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import User from '../../models/UserModel.js';
import generateToken from '../../utils/generateToken.js';

// Dummy ethers
type Ethers = {
  utils: {
    verifyMessage: (message: string, signature: string) => string;
  };
};

const ethers: Ethers = {
  utils: {
    verifyMessage: (message: string, _signature: string) => {
      return message;
    },
  },
};

const verifyAndLogin: fn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress: string | undefined = req.body?.walletAddress;
    const signature: string | undefined = req.body?.signature;

    if (!walletAddress || !signature) {
      const response: IErrorMessage = {
        title: 'Insufficient parameters',
        description:
          'Either the wallet address or signature is not sent the frontend',
        context: {
          values: {
            walletAddress: `${walletAddress}`,
            signature: `${signature}`,
          },
        },
      };
      return next(
        new AppError('Wallet address and signature are required', response, 400)
      );
    }

    const normalizedAddress: string = walletAddress.toLowerCase();

    const user: IUser | null = await User.findOne({
      walletAddress: normalizedAddress,
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: 'Wallet not found. Please request nonce first.' });
    }

    const message: string = `Nonce: ${user.nonce}`;
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (err) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res
        .status(401)
        .json({ error: 'Invalid signature for given wallet address' });
    }

    // Update nonce to prevent replay attacks
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();
    console.log(user._id);
    const token: string | undefined | void = await generateToken(
      String(user._id),
      next
    );
    if (!token) return;

    return res.json({
      token,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
      },
    });
  }
);

export default verifyAndLogin;
