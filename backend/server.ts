import chalk from 'chalk';
import './utils/setup-env.js';

const originalConsoleLog: (...args: unknown[]) => void = console.log;
console.log = (...args: unknown[]) => {
  originalConsoleLog(chalk.bgMagentaBright.black('APP: '), ...args);
};

import app from './app.js';
import './utils/connect-db.js'; // IEFE function to connect to DB

const PORT: number = Number(process.env?.PORT) || 3000;

app.listen(PORT, () => {
  console.log(
    chalk.bgGreen.black(' SUCCESS ') +
      chalk.bold.cyan(' App is listening on ') +
      chalk.bold.magenta.underline(`http://localhost:${PORT}`) +
      chalk.bold.gray(` [${process.env.NODE_ENV || 'development'} mode]`)
  );
});

process.on('SIGINT', () => {
  console.log(
    chalk.bgYellow.black(' SHUTDOWN ') +
      chalk.bold.red(' Gracefully shutting down...')
  );
  process.exit(0);
});
