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
    if (!cartData) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cart = JSON.parse(cartData);

    const order = {
      customerId: "demo-user",
      items: cart.items,
      totalAmount: cart.totalAmount,
      currency: "MAD",
      status: "PAID",
      createdAt: new Date(),
    };

    await db.collection("orders").insertOne(order);

    await redis.del(cartKey);

    res.json({ message: "Order successfully placed", orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Optional: List all orders (for testing)
router.get("/", async (req, res) => {
  const db = await connectMongo();
  const orders = await db.collection("orders").find().toArray();
  res.json(orders);
});

module.exports = router;
