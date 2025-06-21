import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse.js';
import catchAsync from '../../utils/catchAsync.js';
import User from '../../models/UserModel.js';
import generateNDigitRandomNumber from '../../utils/generateNDigitRandomNumber.js';

const requestNonce: fn = catchAsync(async (req: Request, res: Response) => {
  const walletAddress: string | undefined = req.body.walletAddress;
  if (!walletAddress) {
    const response: APIResponse = {
      message: 'Wallet address is required.',
      details: {
        title: 'Missing Wallet Address',
        description:
          'The request must include a valid wallet address in the body.',
      },
      success: false,
      status: 'fail',
      statusCode: 400,
    };
    return sendResponse(res, response);
  }

  let isNewUser: boolean = true;
  let nonce: number = generateNDigitRandomNumber(6);

  const user: IUser | null = await User.findOne({ walletAddress });

  const response: APIResponse = {
    message: 'User created and nonce generated successfully.',
    details: {
      title: 'New User',
      description:
        'A new user was created and a nonce was generated for authentication.',
    },
    success: false,
    status: 'error',
    statusCode: 200,
    data: {
      nonce: nonce,
    },
  };

  if (user) {
    isNewUser = false;
  }

  if (isNewUser) {
    const newUser: IUser = await User.create({ walletAddress, nonce });
    response.data.user = newUser;
  } else {
    response.message = 'Nonce regenerated successfully for existing user.';
    response.details.title = 'Existing User';
    response.details.description =
      'A nonce was regenerated for the existing user for authentication.';

    await User.updateOne({ walletAddress }, { $set: { nonce } });
  }

  sendResponse(res, response);
});

export default requestNonce;
