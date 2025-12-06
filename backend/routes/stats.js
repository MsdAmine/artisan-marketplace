// backend/routes/stats.js
const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const auth = require("../middleware/auth");

// ---------- ADMIN / GLOBAL STATS ----------
// GET /api/stats/sales-by-artisan
// (optional, useful if you want a global overview later)
router.get("/sales-by-artisan", async (req, res) => {
  try {
    const db = await connectMongo();

    const pipeline = [
      { $unwind: "$items" },
      {
        $match: {
          "items.artisanId": { $ne: null },
        },
      },
      {
        $group: {
          _id: "$items.artisanId",
          totalSales: { $sum: "$items.subtotal" },
          totalOrders: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalOrders: { $size: "$totalOrders" },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { artisanId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$artisanId"],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                username: 1,
                name: 1,
                email: 1,
              },
            },
          ],
          as: "artisanInfo",
        },
      },
      {
        $addFields: {
          artisanName: {
            $let: {
              vars: { artisan: { $arrayElemAt: ["$artisanInfo", 0] } },
              in: {
                $let: {
                  vars: {
                    fullName: {
                      $trim: {
                        input: {
                          $concat: [
                            { $ifNull: ["$$artisan.firstName", ""] },
                            " ",
                            { $ifNull: ["$$artisan.lastName", ""] },
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $ifNull: [
                      {
                        $cond: [
                          { $gt: [{ $strLenCP: "$$fullName" }, 0] },
                          "$$fullName",
                          null,
                        ],
                      },
                      {
                        $ifNull: [
                          "$$artisan.name",
                          {
                            $ifNull: [
                              "$$artisan.username",
                              {
                                $ifNull: ["$$artisan.email", { $toString: "$_id" }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    ];

    const stats = await db.collection("orders").aggregate(pipeline).toArray();
    res.json(stats);
  } catch (err) {
    console.error("SALES BY ARTISAN ERROR:", err);
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

// ---------- CURRENT ARTISAN STATS ----------
// GET /api/stats/artisan
router.get("/artisan", auth, async (req, res) => {
  try {
    const db = await connectMongo();
    const artisanId = String(req.user.id); // comes from JWT

    const pipeline = [
      { $unwind: "$items" },
      {
        $match: {
          "items.artisanId": artisanId,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$items.subtotal" },
          totalOrders: { $addToSet: "$_id" }, // distinct orders
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalOrders: { $size: "$totalOrders" },
        },
      },
    ];

    const result = await db.collection("orders").aggregate(pipeline).toArray();
    const baseStats = result[0] || {
      totalSales: 0,
      totalOrders: 0,
    };

    // for now we don’t compute real monthly change → 0
    const response = {
      ...baseStats,
      productCount: 0, // you can compute this later if you want
      salesChangePercent: 0,
    };

    res.json(response);
  } catch (err) {
    console.error("ARTISAN STATS ERROR:", err);
    res.status(500).json({ error: "Failed to compute artisan stats" });
  }
});

module.exports = router;
