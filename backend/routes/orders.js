const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const redis = require("../db/redis");

// Create order from cart
router.post("/", async (req, res) => {
  try {
    const db = await connectMongo();
    const cartKey = "cart:demo-user";

    const cartData = await redis.get(cartKey);
    if (!cartData) return res.status(400).json({ error: "Cart is empty" });

    const cart = JSON.parse(cartData);

    const order = {
      customerId: "demo-user",
      items: cart.items,
      totalAmount: cart.totalAmount,
      currency: "MAD",
      status: "PAID",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    await redis.del(cartKey);

    res.json({ message: "Order placed", orderId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET all orders
router.get("/", async (req, res) => {
  try {
    const db = connectMongo();
    const orders = await db.collection("orders").find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
