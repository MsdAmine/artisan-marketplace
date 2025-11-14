const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");

// GET all products
router.get("/", async (req, res) => {
  const db = await connectMongo();
  const products = await db.collection("products").find({}).toArray();
  res.json(products);
});

// POST create product
router.post("/", async (req, res) => {
  const db = await connectMongo();
  const product = {
    ...req.body,
    currency: "MAD",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("products").insertOne(product);
  res.json({ insertedId: result.insertedId });
});

module.exports = router;