const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

let db = null;

async function connectMongo() {
  if (!db) {
    console.log("Connecting to MongoDB...");
    await client.connect();
    db = client.db("artisan_market");
    console.log("MongoDB ready!");
  }
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected yet — call connectMongo() first.");
  }
  return db;
}

module.exports = { connectMongo, getDB };
