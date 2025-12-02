const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const redis = require("../db/redis");

// Create order from cart
router.post("/", async (req, res) => {
  try {
    const db = await connectMongo();

    const cart = await redis.get("cart:demo-user");
    const cartData = JSON.parse(cart || "{}");

    if (!cartData.items || cartData.items.length === 0) {
      return res.status(400).json({ error: "Panier vide" });
    }

    const newOrder = {
      orderNumber: "ORD-" + Date.now(),
      items: cartData.items.map(i => ({
        productName: i.productName,
        productId: i.productId,
        quantity: i.quantity,
        subtotal: i.subtotal,
        image: i.image
      })),
      totalAmount: cartData.totalAmount,

      // ⭐ DEFAULT STATUS
      status: "processing",

      // ⭐ Payment (replace later if needed)
      paymentMethod: "cash_on_delivery",

      // ⭐ Delivery info (placeholder for now)
      deliveryAddress: {
        name: "Client",
        street: "Adresse inconnue",
        city: "Ville inconnue",
        phone: "",
        email: ""
      },

      createdAt: new Date(),
      estimatedDelivery: null,
      deliveredAt: null
    };

    const result = await db.collection("orders").insertOne(newOrder);

    // Empty the cart
    await redis.del("cart:demo-user");

    res.json({ success: true, orderId: result.insertedId });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});



// GET all orders
router.get("/", async (req, res) => {
  try {
    const db = await connectMongo();
    const orders = await db.collection("orders").find().toArray();

    console.log("Fetched orders:", orders);
    res.json(orders);
  } catch (err) {
    console.error("❌ Orders API error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
