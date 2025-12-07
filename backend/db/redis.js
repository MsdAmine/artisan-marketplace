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

client.on("ready", () => {
  console.log(`Redis connection ready at ${redisUrl}`);
});

client.on("end", () => {
  console.warn("Redis connection closed");
});

client.on("reconnecting", () => {
  console.warn(`Reconnecting to Redis at ${redisUrl}`);
});

async function ensureConnected() {
  if (!client.isOpen) {
    await client.connect();
    const pingResponse = await client.ping();
    console.log(
      `Connected to Redis at ${redisUrl} and responding with: ${pingResponse}`
    );
  }
}

module.exports = {
  async get(key) {
    await ensureConnected();
    const value = await client.get(key);

    if (value !== null) {
      console.log(`CACHE HIT for key "${key}"`);
    } else {
      console.log(`CACHE MISS for key "${key}"`);
    }

    return value;
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
