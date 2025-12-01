const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// GET all artisan products
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE product
router.post("/", async (req, res) => {
  try {
    const db = getDB();

    const product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("products").insertOne(product);

    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();

    const updated = await db.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...req.body,
          updatedAt: new Date()
        }
      }
    );

    res.json({ updated: updated.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
