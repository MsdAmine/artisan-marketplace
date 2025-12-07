const { createClient } = require("redis");

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${
    process.env.REDIS_PORT || 6379
  }`;

const client = createClient({ url: redisUrl });

client.on("error", (err) => {
  console.error("Redis client error", err);
});

async function ensureConnected() {
  if (!client.isOpen) {
    await client.connect();
    console.log(`Connected to Redis at ${redisUrl}`);
  }
}

module.exports = {
  async get(key) {
    await ensureConnected();
    return client.get(key);
  },

  async set(key, value, ttlSeconds) {
    await ensureConnected();
    if (ttlSeconds) {
      return client.setEx(key, ttlSeconds, value);
    }
    return client.set(key, value);
  },

  async del(key) {
    await ensureConnected();
    return client.del(key);
  },
};
