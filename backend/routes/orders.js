// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");
const redis = require("../db/redis");
const auth = require("../middleware/auth");

// Recalculate total safely
function calcTotal(items) {
  return items.reduce(
    (sum, it) => sum + (it.subtotal || it.price * it.quantity),
    0
  );
}

/* -----------------------------------------------------
   GET /api/orders  → List orders (optional)
----------------------------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    const db = await connectMongo();

    // Only return user's orders unless admin
    const filter =
      req.user.role === "admin" ? {} : { userId: new ObjectId(req.user.id) };

    const orders = await db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* -----------------------------------------------------
   GET /api/orders/:id
----------------------------------------------------- */
router.get("/:id", auth, async (req, res) => {
  try {
    const db = await connectMongo();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Customers can only see their own orders
    if (
      req.user.role === "customer" &&
      order.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error("GET ORDER BY ID ERROR", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

/* -----------------------------------------------------
   POST /api/orders  → Create a new order
----------------------------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    const db = await connectMongo();
    const userId = req.user.id;

    // ---- 1) Load cart from Redis (REAL user)
    const rawCart = await redis.get(`cart:${userId}`);
    const cart = JSON.parse(rawCart || "{}");

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cartItems = cart.items;

    // ---- 2) Load referenced products from DB
    const productIds = cartItems.map((i) => new ObjectId(i.productId));
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // ---- 3) Build order items
    const items = cartItems.map((item) => {
      const product = productMap.get(item.productId);
      const price = product ? product.price : item.unitPrice;
      const quantity = item.quantity;

      return {
        productId: item.productId,
        productName: product?.name || item.productName,
        image: product?.image || item.image,
        quantity,
        price,
        subtotal: price * quantity,
        artisanId: product?.artisanId || null,
      };
    });

    // ---- 4) Total
    const totalAmount = calcTotal(items);

    // ---- 5) Request body (payment + delivery info)
    const { paymentMethod = "cash_on_delivery", deliveryAddress = {} } =
      req.body;

    // ---- 6) Create order document
    const orderDoc = {
      userId: new ObjectId(userId),
      orderNumber: `ORD-${Date.now()}`,
      items,
      totalAmount,
      status: "processing",
      paymentMethod,
      deliveryAddress,
      createdAt: new Date(),
      estimatedDelivery: null,
      deliveredAt: null,
    };

    // ---- 7) Insert order
    const result = await db.collection("orders").insertOne(orderDoc);

    // ---- 8) Reduce stock
    const stockOps = items.map((it) => ({
      updateOne: {
        filter: { _id: new ObjectId(it.productId) },
        update: { $inc: { stock: -it.quantity } },
      },
    }));

    if (stockOps.length > 0) {
      await db.collection("products").bulkWrite(stockOps);
    }

    // ---- 9) Clear user's cart
    await redis.del(`cart:${userId}`);

    // ---- 10) Response
    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertedId,
      order: { ...orderDoc, _id: result.insertedId },
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

module.exports = router;
