import User from '../models/UserModel.js';
import mongoose from 'mongoose';
import chalk from 'chalk';

const mongooseURI: string = 'mongodb://localhost:27017/fitfi';
const walletAddress: string = '0x1234567890abcdef1234567890abcdef12345678';

(async () => {
  try {
    await mongoose.connect(mongooseURI);
    console.log(
      chalk.bgGreen.black(' SUCCESS ') +
        ' ' +
        chalk.green('Connected to MongoDB successfully.')
    );
  } catch (error: any) {
    console.error(
      chalk.bgRed.white(' ERROR ') +
        ' ' +
        chalk.red('Error connecting to MongoDB:'),
      chalk.red(error.message)
    );
    process.exit(1);
  }

  if (await User.exists({ walletAddress })) {
    console.log(
      chalk.bgYellow.black(' WARNING ') +
        ' ' +
        chalk.yellow('Admin account already exists.')
    );
    console.log(
      chalk.bgRed.white(' DELETE ') +
        ' ' +
        chalk.red('Deleting existing account...')
    );
    await User.deleteOne({ walletAddress });
    console.log(
      chalk.bgGreen.black(' SUCCESS ') +
        ' ' +
        chalk.green('Existing admin account deleted successfully.')
    );
  }

  const user: Partial<IUser> = {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    nonce: 871263,
    createdAt: new Date(),
    username: 'admin',
    role: 'admin',
  };

  try {
    await User.create(user);
    console.log(
      chalk.bgGreen.black(' SUCCESS ') +
        ' ' +
        chalk.green('Admin account created successfully.')
    );
    process.exit(0);
  } catch (error: any) {
    console.error(
      chalk.bgRed.white(' ERROR ') +
        ' ' +
        chalk.red('Error creating admin account:'),
      chalk.red(error.message)
    );
    process.exit(1);
  }
})();
