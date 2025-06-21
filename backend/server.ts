import chalk from 'chalk';
import './utils/console-color.js';
import './utils/setup-env.js';
import app from './app.js';
import './utils/connect-db.js';
import { createServer, Server as HttpServer } from 'node:http';
import { initiateSocket } from './services/sockets/index.js';

const PORT: number = Number(process.env?.PORT) || 3000;

const httpServer: HttpServer = createServer(app);
initiateSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    chalk.bgGreen.black(' SUCCESS ') +
      chalk.bold.cyan(' App is listening on ') +
      chalk.bold.rgb(233, 8, 233).underline(`http://localhost:${PORT}`) +
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
