const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// ---------------------------------------
// GET all products
// ---------------------------------------
router.get("/", async (req, res) => {
  try {
    const db = await connectMongo();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ---------------------------------------
// GET product by ID
// ---------------------------------------
router.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const db = await connectMongo();

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

module.exports = router;
