import mongoose from 'mongoose';
import chalk from 'chalk';

// This is a valid IIFE (Immediately Invoked Function Expression) in TypeScript/JavaScript
(() => {
  let MONGOOSE_URI: string | undefined = process.env?.MONGOOSE_URI;
  if (!MONGOOSE_URI) {
    console.log(
      chalk.red('Error: ') +
        chalk.yellow('MONGOOSE_URI environment variable is not set.') +
        '\n' +
        chalk.gray(
          'Please set the MONGOOSE_URI variable in your environment before running the application.'
        ) +
        '\n' +
        chalk.yellow('Current value: ') +
        chalk.gray(String(MONGOOSE_URI))
    );
    process.exit(-1);
  }

  if (MONGOOSE_URI.includes('<username>')) {
    const username: string | undefined = process.env.MONGOOSE_USERNAME;
    if (!username) {
      console.log(
        chalk.red('Error: ') +
          chalk.yellow('MONGOOSE_USERNAME environment variable is not set.') +
          '\n' +
          chalk.gray(
            'Please set the MONGOOSE_USERNAME variable in your environment secrets before running the application.'
          )
      );
      process.exit(-1);
    }
    MONGOOSE_URI = MONGOOSE_URI.replace('<username>', username);
  }
  if (MONGOOSE_URI.includes('<password>')) {
    const password: string | undefined = process.env.MONGOOSE_PASSWORD;
    if (!password) {
      console.log(
        chalk.red('Error: ') +
          chalk.yellow('MONGOOSE_PASSWORD environment variable is not set.') +
          '\n' +
          chalk.gray(
            'Please set the MONGOOSE_PASSWORD variable in your environment secrets before running the application.'
          )
      );
      process.exit(-1);
    }
    MONGOOSE_URI = MONGOOSE_URI.replace('<password>', password);
  }

  mongoose
    .connect(MONGOOSE_URI)
    .then(() => {
      console.log(
        chalk.green('Success: ') +
          chalk.magenta('Connected to MongoDB successfully.')
      );
    })
    // CRITICAL: Unsafe area may cause type checking errors
    .catch((err: unknown) => {
      console.log(
        chalk.red('Error: ') +
          chalk.yellow('Failed to connect to MongoDB.') +
          '\n' +
          chalk.gray(String(err))
      );
      process.exit(-1);
    })
    .finally(() => {
      console.log(
        chalk.blue('Info: ') +
          chalk.gray('Mongoose connection attempt finished.')
      );
    });
})();
