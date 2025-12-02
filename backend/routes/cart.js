const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const redis = require("../db/redis");
const { ObjectId } = require("mongodb");

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
      
      // Add user identifier
      userId: "demo-user", // In real app, this would come from auth
      
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

// GET all orders (for admin)
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

// GET orders for specific user (Add this route!)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await connectMongo();
    
    console.log(`Fetching orders for user: ${userId}`);
    
    const orders = await db.collection("orders")
      .find({ userId: userId })
      .sort({ createdAt: -1 }) // Newest first
      .toArray();

    console.log(`Found ${orders.length} orders for user ${userId}`);
    res.json(orders);
  } catch (err) {
    console.error("❌ User orders API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET single order by ID
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = await connectMongo();
    
    let query;
    if (ObjectId.isValid(orderId)) {
      query = { _id: new ObjectId(orderId) };
    } else {
      query = { orderNumber: orderId };
    }
    
    const order = await db.collection("orders").findOne(query);
    
    if (!order) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }
    
    res.json(order);
  } catch (err) {
    console.error("❌ Single order API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status requis" });
    }
    
    const db = await connectMongo();
    
    const updateData = { status };
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }
    
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }
    
    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("❌ Update order error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;