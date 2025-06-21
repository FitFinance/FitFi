import { createClient, RedisClientType } from 'redis';
import chalk from 'chalk';

let redisClient: RedisClientType<any, any> | null = null;

async function getRedisClient(): Promise<RedisClientType<any, any>> {
  if (redisClient) {
    return redisClient;
  }

  console.log(
    chalk.bgBlue('REDIS: '),
    chalk.blue('Attempting connection to Redis')
  );

  redisClient = createClient({
    url: process.env.REDIS_URI,
    password: process.env.REDIS_PASS,
  });

  // Handle connection errors
  redisClient.on('error', (err: any) => {
    console.log(
      chalk.bgRed('FATAL'),
      chalk.red('Redis connection error:'),
      err
    );
    process.exit(-1);
  });

  // Handle successful connection
  redisClient.on('connect', () => {
    console.log(chalk.bgGreen('REDIS:'), chalk.green('Connected to Redis'));
  });

  await redisClient.connect();

  if (!redisClient) {
    console.log(chalk.bgRed('FATAL'), chalk.red('Redis failed to connect'));
    process.exit(-1);
  }

  return redisClient;
}

export default getRedisClient;
