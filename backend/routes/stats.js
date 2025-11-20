const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");

// GET /api/stats/sales-by-artisan
router.get("/sales-by-artisan", async (req, res) => {
  try {
    const db = await connectMongo();

    const result = await db.collection("orders").aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.artisanId",
          totalSales: { $sum: "$items.subtotal" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

// Optional: sales per day
router.get("/sales-by-day", async (req, res) => {
  try {
    const db = await connectMongo();

    const result = await db.collection("orders").aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to compute daily stats" });
  }
});

module.exports = router;
