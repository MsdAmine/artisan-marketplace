const express = require("express");
const router = express.Router();
const redis = require("../db/redis");
const { getDB } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// Load cart from redis
async function loadCart(userId) {
  const data = await redis.get(`cart:${userId}`);
  return data ? JSON.parse(data) : { items: [], totalAmount: 0, currency: "MAD" };
}

// GET /api/cart
router.get("/", async (req, res) => {
  const cart = await loadCart("demo-user");
  res.json(cart);
});

// POST /api/cart/items - add product to cart
router.post("/items", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const db = getDB(); // FIXED — removed connectMongo()

    // Get product
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Load existing cart
    const cart = await loadCart("demo-user");

    const existing = cart.items.find((i) => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * product.price;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        unitPrice: product.price,
        quantity,
        subtotal: quantity * product.price,
        artisanId: product.artisanId
      });
    }

    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

    await redis.set(`cart:demo-user`, JSON.stringify(cart));

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

module.exports = router;
