// backend/routes/stats.js
const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");

// GET /api/stats/sales-by-artisan
router.get("/sales-by-artisan", async (req, res) => {
  try {
    const db = await connectMongo();

    const pipeline = [
      { $unwind: "$items" },

      // only count items where artisanId exists
      { $match: { "items.artisanId": { $ne: null, $ne: "" } } },

      {
        $group: {
          _id: "$items.artisanId", // artisan id (string)
          totalSales: { $sum: "$items.subtotal" },
          orderIds: { $addToSet: "$_id" }, // unique order count
        },
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalOrders: { $size: "$orderIds" },
        },
      },
    ];

    const stats = await db.collection("orders").aggregate(pipeline).toArray();

    res.json(stats);
  } catch (err) {
    console.error("SALES BY ARTISAN ERROR", err);
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

module.exports = router;
