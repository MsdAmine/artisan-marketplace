const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

const { connectMongo } = require("../db/mongo");
const auth = require("../middleware/auth");

// -------------------------------
// POST /api/product-ratings
// Persist user ratings for purchased products
// -------------------------------
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, ratings } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!orderId || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Valid orderId is required" });
    }

    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res
        .status(400)
        .json({ error: "Provide at least one rating to submit" });
    }

    const db = await connectMongo();

    // Ensure the order exists and belongs to the authenticated user
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found for this user" });
    }

    const orderItems = order.items || [];
    const operations = [];

    for (const rating of ratings) {
      const { productId, rating: value, orderItemId = null } = rating || {};

      if (!productId || !ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ error: "Each rating must include a valid productId" });
      }

      const numericRating = Number(value);
      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
        return res
          .status(400)
          .json({ error: "Ratings must be numbers between 1 and 5" });
      }

      const matchingOrderItem = orderItems.find(
        (item) => item.productId === productId || item.productId === productId?.toString()
      );

      if (!matchingOrderItem) {
        return res.status(400).json({
          error: `Product ${productId} is not part of the specified order`,
        });
      }

      const productObjectId = new ObjectId(productId);
      const effectiveOrderItemId = orderItemId || matchingOrderItem._id || null;

      operations.push({
        updateOne: {
          filter: {
            userId: new ObjectId(userId),
            orderId: new ObjectId(orderId),
            productId: productObjectId,
          },
          update: {
            $set: {
              rating: numericRating,
              orderItemId: effectiveOrderItemId,
              productName: matchingOrderItem.productName || null,
              quantity: matchingOrderItem.quantity || 1,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              userId: new ObjectId(userId),
              orderId: new ObjectId(orderId),
              productId: productObjectId,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length > 0) {
      await db.collection("productRatings").bulkWrite(operations);
    }

    res.json({ success: true, saved: operations.length });
  } catch (err) {
    console.error("SAVE PRODUCT RATINGS ERROR", err);
    res.status(500).json({ error: "Failed to save product ratings" });
  }
});

module.exports = router;
