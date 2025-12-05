const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// ===============================================
// PRODUCT CRUD & FETCHING
// (Mounted at /api/products)
// ===============================================

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
// GET products by artisan (READ)
// ---------------------------------------
router.get("/by-artisan/:artisanId", async (req, res) => {
  try {
    const db = await connectMongo();
    const products = await db
      .collection("products")
      .find({ artisanId: req.params.artisanId })
      .toArray();

    res.json(products);
  } catch (err) {
    console.error("Error in /api/products/by-artisan/:artisanId", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ---------------------------------------
// GET product by ID (READ)
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

// ---------------------------------------
// CREATE product (POST)
// ---------------------------------------
router.post("/", async (req, res) => {
  try {
    const db = await connectMongo();

    const product = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      category: req.body.category,
      artisanId: req.body.artisanId,
      image: req.body.image || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    res.json({ insertedId: result.insertedId, product });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// UPDATE product (PUT)
// ---------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const db = await connectMongo();

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      category: req.body.category,
      artisanId: req.body.artisanId,
      updatedAt: new Date(),
    };

    if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    res.json({ updated: updated.modifiedCount });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// DELETE product (DELETE)
// ---------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectMongo();

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
