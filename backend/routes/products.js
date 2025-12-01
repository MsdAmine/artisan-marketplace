const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// GET all products
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });

    res.json(product || { error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
