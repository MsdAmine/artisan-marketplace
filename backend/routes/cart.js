const express = require("express");
const router = express.Router();
const redis = require("../db/redis");
const { connectMongo } = require("../db/mongo");

// Load cart
async function loadCart(userId) {
  const data = await redis.get(`cart:${userId}`);
  return data ? JSON.parse(data) : { items: [], totalAmount: 0, currency: "MAD" };
}

// GET cart
router.get("/", async (req, res) => {
  const cart = await loadCart("demo-user");
  res.json(cart);
});

// Add item to cart
router.post("/items", async (req, res) => {
  const { productId, quantity } = req.body;

  const db = await connectMongo();
  const product = await db
    .collection("products")
    .findOne({ _id: productId });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const cart = await loadCart("demo-user");
  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = existing.quantity * existing.unitPrice;
  } else {
    cart.items.push({
      productId,
      productName: product.name,
      unitPrice: product.price,
      quantity,
      subtotal: quantity * product.price,
      currency: "MAD",
    });
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  await redis.set(`cart:demo-user`, JSON.stringify(cart));

  res.json(cart);
});

module.exports = router;
