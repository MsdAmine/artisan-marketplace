const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

let db = null;

async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DBNAME);
    console.log("MongoDB connected");
  }
  return db;
}

module.exports = { connectMongo };