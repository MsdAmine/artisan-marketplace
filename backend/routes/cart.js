const express = require("express");
const router = express.Router();
const redis = require("../db/redis");
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// Load user's cart
async function loadCart(userId) {
  const data = await redis.get(`cart:${userId}`);
  return data
    ? JSON.parse(data)
    : { items: [], totalAmount: 0, currency: "MAD" };
}

// GET /api/cart
router.get("/", async (req, res) => {
  const cart = await loadCart("demo-user");
  res.json(cart);
});

// POST /api/cart/items  (Add item)
router.post("/items", async (req, res) => {
  const { productId, quantity } = req.body;

  const db = await connectMongo();
  let product;

  try {
    product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });
  } catch (err) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const cart = await loadCart("demo-user");
  const existing = cart.items.find((i) => i.productId === productId);

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
      artisanId: product.artisanId,
      currency: "MAD",
    });
  }

  cart.totalAmount = cart.items.reduce((s, x) => s + x.subtotal, 0);

  await redis.set(`cart:demo-user`, JSON.stringify(cart));
  res.json(cart);
});

// PUT /api/cart/items/:productId  (Update quantity)
router.put("/items/:productId", async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await loadCart("demo-user");
  const item = cart.items.find((i) => i.productId === productId);

  if (!item) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  item.quantity = quantity;
  item.subtotal = item.unitPrice * item.quantity;

  cart.totalAmount = cart.items.reduce((s, x) => s + x.subtotal, 0);

  await redis.set(`cart:demo-user`, JSON.stringify(cart));
  res.json(cart);
});

// DELETE /api/cart/items/:productId  (Remove item)
router.delete("/items/:productId", async (req, res) => {
  const { productId } = req.params;

  const cart = await loadCart("demo-user");
  cart.items = cart.items.filter((i) => i.productId !== productId);

  cart.totalAmount = cart.items.reduce((s, x) => s + x.subtotal, 0);

  await redis.set(`cart:demo-user`, JSON.stringify(cart));
  res.json(cart);
});

module.exports = router;
