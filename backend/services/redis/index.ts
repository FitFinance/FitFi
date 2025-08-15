import { createClient, RedisClientType } from 'redis';
import chalk from 'chalk';

let redisClient: RedisClientType<any, any> | null = null;
let attemptedPasswordFallback: boolean = false;

function wireEvents(
  client: RedisClientType<any, any>,
  usedPassword: boolean
): void {
  client.on('error', async (err: any) => {
    const msg: string = String(err?.message || err);
    console.log(chalk.bgRed('REDIS'), chalk.red('Client error:'), msg);
    if (
      usedPassword &&
      !attemptedPasswordFallback &&
      /ERR AUTH|NOAUTH|WRONGPASS/i.test(msg)
    ) {
      attemptedPasswordFallback = true;
      console.log(
        chalk.bgYellow('REDIS'),
        chalk.yellow('Auth failed; attempting reconnect WITHOUT password')
      );
      try {
        const old: RedisClientType<any, any> | null = redisClient;
        // Create new client without password
        const baseOptions: any = (old as any)?.options || {};
        if (baseOptions.password) delete baseOptions.password;
        const newClient: RedisClientType<any, any> = createClient(baseOptions);
        wireEvents(newClient, false);
        await newClient.connect();
        redisClient = newClient;
        // Disconnect old after swap
        old?.quit().catch(() => {});
        console.log(
          chalk.bgGreen('REDIS'),
          chalk.green('Reconnected without password successfully')
        );
      } catch (fallbackErr) {
        console.log(
          chalk.bgRed('REDIS'),
          chalk.red('Password fallback reconnect failed'),
          fallbackErr
        );
      }
    }
  });
  client.on('connect', () => {
    console.log(chalk.bgGreen('REDIS'), chalk.green('Connected'));
  });
}

export async function initRedis(): Promise<void> {
  if (redisClient) {
    console.log(chalk.bgBlue('REDIS'), chalk.blue('Already initialized'));
    return;
  }

  const url: string | undefined =
    process.env.REDIS_URI || process.env.REDIS_URL;
  const password: string | undefined = process.env.REDIS_PASS;

  console.log(
    chalk.bgBlue('REDIS:'),
    chalk.blue(
      `Attempting connection${url ? ' to ' + url : ' with default localhost'} `
    )
  );

  const baseOptions: any = url
    ? {
        url,
        socket: {
          reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
        },
      }
    : {};

  async function attempt(
    usePassword: boolean
  ): Promise<RedisClientType<any, any>> {
    const opts: Record<string, any> = { ...baseOptions };
    if (usePassword && password) opts.password = password;
    const client: RedisClientType<any, any> = createClient(
      Object.keys(opts).length ? (opts as any) : undefined
    );
    wireEvents(client, usePassword);
    await client.connect();
    return client;
  }

  try {
    redisClient = await attempt(!!password);
  } catch (err: any) {
    const msg: string = String(err?.message || err);
    if (password && /AUTH|NOAUTH|WRONGPASS/i.test(msg)) {
      console.log(
        chalk.bgYellow('REDIS'),
        chalk.yellow(
          'Auth failed with provided password; retrying without password'
        )
      );
      try {
        redisClient = await attempt(false);
      } catch (retryErr) {
        console.log(
          chalk.bgRed('REDIS'),
          chalk.red('Retry without password failed'),
          retryErr
        );
        throw retryErr;
      }
    } else {
      console.log(
        chalk.bgRed('REDIS'),
        chalk.red('Initial connection failed'),
        err
      );
      throw err;
    }
  }

  if (!redisClient) {
    throw new Error('Redis failed to connect');
  }

  console.log(chalk.bgGreen('REDIS'), chalk.green('Initialization complete'));
}

async function getRedisClient(): Promise<RedisClientType<any, any>> {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redisClient;
}

export default getRedisClient;
