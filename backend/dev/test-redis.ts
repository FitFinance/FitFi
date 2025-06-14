import redis from 'redis';

(async () => {
  const client: redis.RedisClientType = redis.createClient({
    url: 'redis://localhost:6379', // or set from env
  });

  client.on('error', (err: any) => {
    console.error('Redis Client Error:', err);
  });

  try {
    await client.connect();
    console.log('Connected to Redis successfully.');

    const reply: string | null = await client.set(
      'testKey',
      'This is a test value'
    );
    console.log('Set key reply:', reply);
  } catch (err) {
    console.error('Failed to connect or set key:', err);
    process.exit(1);
  }
})();
