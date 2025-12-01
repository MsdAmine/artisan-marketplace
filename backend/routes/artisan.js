const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// ---------------------------------------
// GET all artisan products
// ---------------------------------------
router.get("/", async (req, res) => {
  try {
    const db = await connectMongo();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// CREATE product  (Cloudinary URL expected)
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
      image: req.body.image || "",     // <-- Cloudinary URL from frontend
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("products").insertOne(product);

    res.json({ insertedId: result.insertedId, product });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// UPDATE product
// (expects new Cloudinary URL in req.body.image)
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
      updatedAt: new Date()
    };

    // If image was replaced → frontend sends a new Cloudinary URL
    if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = await db.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    res.json({ updated: updated.modifiedCount });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// DELETE product (Cloudinary delete optional later)
// ---------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectMongo();

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
