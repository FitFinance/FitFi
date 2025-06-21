import { createClient, RedisClientType } from 'redis';

let redisclient: RedisClientType<any, any> | null = null;

async function getRedisClient(): Promise<RedisClientType<any, any>> {
  if (redisclient) {
    return redisclient;
  }

  redisclient = createClient({
    url: process.env.REDIS_URI,
    password: process.env.REDIS_PASS,
  });
  await redisclient.connect();

  return redisclient;
}

export default getRedisClient;
