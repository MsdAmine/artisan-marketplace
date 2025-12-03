const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const redis = require("../db/redis");

router.post("/", async (req, res) => {
  try {
    const db = await connectMongo();

    const {
      userId,
      paymentMethod = "cash_on_delivery",
      deliveryAddress = {},
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // 1. Load cart for this user
    const cart = await db.collection("cart").findOne({ userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 2. Load products referenced in the cart
    const productIds = cart.items.map((i) => new ObjectId(i.productId));
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. Build order items with artisanId stored explicitly
    const items = cart.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const quantity = item.quantity;
      const unitPrice = product.price;
      const subtotal = unitPrice * quantity;

      return {
        productId: item.productId, // string
        productName: product.name,
        quantity,
        subtotal,
        image: product.image,
        artisanId: String(product.artisanId || ""), // 👈 important
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const orderNumber = `ORD-${Date.now()}`;

    const orderDoc = {
      userId,
      orderNumber,
      items,
      totalAmount,
      status: "processing",
      paymentMethod,
      deliveryAddress,
      createdAt: new Date(),
      estimatedDelivery: null,
      deliveredAt: null,
    };

    // 4. Insert order
    const result = await db.collection("orders").insertOne(orderDoc);

    // 5. Decrease stock for each product
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.productId) },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    if (bulkOps.length) {
      await db.collection("products").bulkWrite(bulkOps);
    }

    // 6. Clear cart
    await db.collection("cart").updateOne({ userId }, { $set: { items: [] } });

    res.json({ orderId: result.insertedId });
  } catch (err) {
    console.error("CREATE ORDER ERROR", err);
    res.status(500).json({ error: "Failed to create order" });
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
