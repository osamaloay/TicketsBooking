// utils/redisClient.js
const { createClient } = require('redis');

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

client.on('error', (err) => console.error('❌ Redis Client Error:', err));

// Connect only once
(async () => {
  try {
    await client.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }
})();

module.exports = client;
