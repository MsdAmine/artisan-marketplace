let store = {};

module.exports = {
  async get(key) {
    return store[key] || null;
  },
  async set(key, value) {
    store[key] = value;
  },
  async del(key) {
    delete store[key];
  }
};
  