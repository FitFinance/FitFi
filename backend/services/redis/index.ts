import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType<any, any> | null = null;

async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URI,
    password: process.env.REDIS_PASS,
  });
  await redisClient.connect();

  return redisClient;
}

export default getRedisClient;
