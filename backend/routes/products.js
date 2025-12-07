// backend/routes/products.js (INCHANGÉ - CORRESPOND À VOTRE CODE FOURNI)

const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");
const { getFollowers } = require("../neo4j/actions");
const redis = require("../db/redis");

// ===============================================
// PRODUCT CRUD & FETCHING
// (Mounted at /api/products)
// ===============================================

// ---------------------------------------
// GET all products
// ---------------------------------------
router.get("/", async (req, res) => {
  try {
    const cacheKey = "products:all";
    const cachedProducts = await redis.get(cacheKey);

    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    const db = await connectMongo();
    const products = await db.collection("products").find().toArray();

    await redis.set(cacheKey, JSON.stringify(products), 300);
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

    // Notify followers that this artisan published a new product
    try {
      const followerIds = req.neo4jDriver
        ? await getFollowers(req.neo4jDriver, product.artisanId)
        : [];

      if (followerIds.length > 0) {
        const notifications = followerIds.map((userId) => ({
          userId,
          artisanId: product.artisanId,
          productId: result.insertedId.toString(),
          productName: product.name,
          type: "new_product",
          read: false,
          createdAt: new Date(),
        }));

        await db.collection("notifications").insertMany(notifications);
      }
    } catch (notificationErr) {
      console.error("Failed to create notifications for followers", notificationErr);
    }

    await redis.del("products:all");
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

    await redis.del("products:all");
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

    await redis.del("products:all");
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// GET product average rating (READ) 
// Mounted at /api/products/:productId/rating
// ---------------------------------------
router.get("/:productId/rating", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const db = await connectMongo();

    // Agrégation MongoDB pour calculer la moyenne et le compte
    const aggregationResult = await db.collection("productRatings").aggregate([
      {
        // 1. Filtrer par le produit spécifique
        $match: { productId: new ObjectId(productId) },
      },
      {
        // 2. Grouper toutes les notes pour ce produit
        $group: {
          _id: "$productId",
          average: { $avg: "$rating" }, // Calcul de la note moyenne
          totalReviews: { $sum: 1 },    // Compte du nombre total d'avis
        },
      },
    ]).toArray();

    let average = 0;
    let totalReviews = 0;

    if (aggregationResult.length > 0) {
      average = parseFloat(aggregationResult[0].average.toFixed(1)); // Limiter à une décimale
      totalReviews = aggregationResult[0].totalReviews;
    }

    // Le front-end attend { average: number, totalReviews: number }
    res.json({ average, totalReviews });
  } catch (err) {
    console.error("GET PRODUCT AVERAGE RATING ERROR", err);
    res.status(500).json({ error: "Failed to calculate product rating" });
  }
});

module.exports = router;
