const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("artisan_market");
  console.log("MongoDB connected!");
  return db;
}

// Important: export BOTH the db variable AND the connect function
module.exports = { connectDB, getDB: () => db };
