import { createClient, RedisClientType } from 'redis';

type ClientType = RedisClientType;

const client: ClientType = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err: any) => {
  console.error('Redis Client Error', err);
});

(async () => {
  try {
    await client.connect();
    console.log('🔗 Redis client connected');
  } catch (err) {
    console.error('❌ Failed to connect Redis client', err);
    process.exit(1);
  }
})();

export default client;
