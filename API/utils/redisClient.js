// utils/redisClient.js
// Mock Redis client for development without Redis
const mockClient = {
  connect: async () => {
    console.log('ℹ️ Using in-memory storage (Redis is disabled)');
    return true;
  },
  set: async (key, value) => {
    console.log(`ℹ️ In-memory storage: Setting ${key}`);
    return true;
  },
  get: async (key) => {
    console.log(`ℹ️ In-memory storage: Getting ${key}`);
    return null;
  },
  del: async (key) => {
    console.log(`ℹ️ In-memory storage: Deleting ${key}`);
    return true;
  }
};

// Export mock client directly
module.exports = mockClient;
