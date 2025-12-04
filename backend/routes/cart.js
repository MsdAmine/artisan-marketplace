const express = require("express");
const router = express.Router();
const redis = require("../db/redis");
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// All routes require login
const auth = require("../middleware/auth");
router.use(auth);

// GET cart
router.get("/", async (req, res) => {
  const cartKey = `cart:${req.user.id}`;

  const cart = await redis.get(cartKey);
  res.json(JSON.parse(cart || '{"items":[],"totalAmount":0}'));
});

// ADD item
router.post("/items", async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: "productId missing" });

  const cartKey = `cart:${req.user.id}`;
  let cart = JSON.parse(
    (await redis.get(cartKey)) || '{"items":[],"totalAmount":0}'
  );

  const db = await connectMongo();
  const product = await db
    .collection("products")
    .findOne({ _id: new ObjectId(productId) });

  if (!product) return res.status(404).json({ error: "Produit introuvable" });

  let existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = existing.quantity * existing.unitPrice;
  } else {
    cart.items.push({
      productId,
      productName: product.name,
      unitPrice: product.price,
      quantity,
      subtotal: product.price * quantity,
      image: product.image,
    });
  }

  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

  await redis.set(cartKey, JSON.stringify(cart));
  res.json(cart);
});

// UPDATE quantity
router.put("/items/:productId", async (req, res) => {
  const cartKey = `cart:${req.user.id}`;
  const { productId } = req.params;
  const { quantity } = req.body;

  let cart = JSON.parse(
    (await redis.get(cartKey)) || '{"items":[],"totalAmount":0}'
  );

  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.quantity = quantity;
  item.subtotal = quantity * item.unitPrice;

  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

  await redis.set(cartKey, JSON.stringify(cart));
  res.json(cart);
});

// DELETE item
router.delete("/items/:productId", async (req, res) => {
  const cartKey = `cart:${req.user.id}`;
  const { productId } = req.params;

  let cart = JSON.parse(
    (await redis.get(cartKey)) || '{"items":[],"totalAmount":0}'
  );

  cart.items = cart.items.filter((i) => i.productId !== productId);
  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

  await redis.set(cartKey, JSON.stringify(cart));
  res.json(cart);
});

module.exports = router;
