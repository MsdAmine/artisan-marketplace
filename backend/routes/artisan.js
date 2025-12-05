const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

const {
  followArtisan,
  unfollowArtisan,
  getArtisanStats,
} = require("../neo4j/actions");

// -------------------------------
// Utility: Safely Get current user ID
// -------------------------------
function getCurrentUserId(req) {
  try {
    // SAFELY read params → no more undefined errors
    return req.query?.userId || req.body?.userId || null;
  } catch (e) {
    return null;
  }
}

// =======================================================
// SEARCH Artisans → /api/artisans/search?q=Name
// =======================================================
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const db = await connectMongo();

    const results = await db
      .collection("users")
      .find(
        {
          role: "artisan",
          name: { $regex: query, $options: "i" },
        },
        {
          projection: {
            password: 0,
          },
        }
      )
      .limit(20)
      .toArray();

    res.json({ artisans: results });
  } catch (err) {
    console.error("Error searching artisans:", err);
    res.status(500).json({ error: "Server error searching artisans" });
  }
});

// =======================================================
// GET Artisan Profile → /api/artisans/:artisanId/profile
// =======================================================
router.get("/:artisanId/profile", async (req, res) => {
  try {
    const artisanId = req.params.artisanId;
    const currentUserId = getCurrentUserId(req);

    if (!ObjectId.isValid(artisanId)) {
      return res.status(400).json({ error: "Invalid artisan ID" });
    }

    const db = await connectMongo();

    // 1️⃣ Fetch artisan info
    const artisan = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(artisanId) },
        { projection: { password: 0 } }
      );

    if (!artisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }
    // FIX: Ensure joinedDate is available (using _id timestamp if missing)
    if (!artisan.joinedDate) {
      artisan.joinedDate = new ObjectId(artisan._id).getTimestamp().toISOString();
    }

    // 2️⃣ Fetch artisan products
    const products = await db
      .collection("products")
      .find({ artisanId: artisanId }) // artisanId stored as STRING
      .toArray();

    // 3️⃣ Fetch Neo4j stats & Mongo Sales/Rating Stats

    // A. Get Neo4j Stats (Followers)
    const driver = req.neo4jDriver;
    let neo4jStats = { followers: 0, isFollowing: false };

    if (driver) {
      neo4jStats = await getArtisanStats(driver, artisanId, currentUserId);
    }

    // B. Get Mongo Ratings Stats from the dedicated productRatings collection
    const mongoRatingStats = await db.collection("productRatings")
      .aggregate([
        {
          $lookup: {
            from: "products",
            let: { ratedProductId: "$productId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$ratedProductId"] },
                },
              },
            ],
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        { $match: { "productDetails.artisanId": artisanId } },
        {
          $group: {
            _id: "$productDetails.artisanId",
            totalRatingSum: { $sum: "$rating" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const ratingData = mongoRatingStats[0] || {};
    let averageRating = 0;

    if (ratingData.totalRatings && ratingData.totalRatings > 0) {
      // Calculate average rating, rounding to one decimal place
      averageRating = Math.round((ratingData.totalRatingSum / ratingData.totalRatings) * 10) / 10;
    }

    // C. Get Mongo Sales Stats (Aggregation using Orders and Products)
    // This pipeline links items in the orders collection back to the product, 
    // and then filters by the product's artisanId to calculate total sales.
    const totalSalesResult = await db.collection("orders")
      .aggregate([
        // Flatten the items array so each order line is its own document
        { $unwind: "$items" },
        {
          // Lookup the product details from the products collection
          $lookup: {
            from: "products",
            // Use $lookup with pipeline to ensure correct type conversion for ObjectId
            let: { productIdStr: "$items.productId" },
            pipeline: [
              // Convert the string productId to ObjectId for matching against product's _id
              { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$productIdStr" }] } } },
            ],
            as: "productDetails"
          }
        },
        // Remove orders whose line item couldn't be linked to a product
        { $match: { "productDetails": { $ne: [] } } },
        // Flatten the productDetails array
        { $unwind: "$productDetails" },
        // Match the line items that belong to the target artisan
        { $match: { "productDetails.artisanId": artisanId } },
        {
          // Group all matched line items and sum the quantities
          $group: {
            _id: null,
            // ASSUMPTION: The sales quantity is stored in items.quantity
            totalSales: { $sum: "$items.quantity" }
          }
        }
      ])
      .toArray();

    const totalSales = totalSalesResult[0]?.totalSales || 0;

    // Merge Neo4j and Mongo stats
    const finalStats = {
      ...neo4jStats,
      totalSales: totalSales,
      averageRating: averageRating,
    };

    // 4️⃣ Respond with profile
    res.json({ artisan, products, stats: finalStats });

  } catch (err) {
    console.error("Error fetching artisan profile:", err);
    res.status(500).json({
      error: "Server error fetching profile",
      details: err.message,
    });
  }
});

// =======================================================
// POST Follow Artisan → /api/artisans/:artisanId/follow
// =======================================================
router.post("/:artisanId/follow", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const artisanId = req.params.artisanId;
    const driver = req.neo4jDriver;

    if (!driver) return res.status(500).json({ error: "Neo4j driver missing" });
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (userId === artisanId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    await followArtisan(driver, userId, artisanId);

    res.json({ success: true, action: "followed" });
  } catch (err) {
    console.error("Failed to follow artisan:", err);
    res.status(500).json({ error: "Failed to follow artisan" });
  }
});

// =========================================================
// POST Unfollow Artisan → /api/artisans/:artisanId/unfollow
// =========================================================
router.post("/:artisanId/unfollow", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const artisanId = req.params.artisanId;
    const driver = req.neo4jDriver;

    if (!driver) return res.status(500).json({ error: "Neo4j driver missing" });
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (userId === artisanId) {
      return res.status(400).json({ error: "You cannot unfollow yourself" });
    }
    await unfollowArtisan(driver, userId, artisanId);

    res.json({ success: true, action: "unfollowed" });
  } catch (err) {
    console.error("Failed to unfollow artisan:", err);
    res.status(500).json({ error: "Failed to unfollow artisan" });
  }
});

// ===============================================
// UPDATE ARTISAN PROFILE  →  PUT /api/artisans/:id
// ===============================================
router.put("/:id", async (req, res) => {
  try {
    const artisanId = req.params.id;
    const userId = req.user?.id || req.body.userId; // fallback for non-token setups

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId missing" });
    }

    if (userId !== artisanId) {
      return res
        .status(403)
        .json({ error: "You cannot edit another user's profile" });
    }

    if (!ObjectId.isValid(artisanId)) {
      return res.status(400).json({ error: "Invalid user/artisan ID" });
    }

    const db = await connectMongo();

    // Allowed fields
    const allowed = [
      "name",
      "bio",
      "location",
      "avatar",
      "email",
      "phone",
      "website",
    ];
    const updateData = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(artisanId) },
        { $set: updateData },
        { returnDocument: "after", projection: { password: 0 } }
      );

    res.json({
      success: true,
      message: "Profile updated successfully",
      artisan: result,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      error: "Server error updating profile",
      details: err.message,
    });
  }
});

router.patch("/:artisanId", async (req, res) => {
  try {
    const artisanId = req.params.artisanId;
    const userId = getCurrentUserId(req);

    if (!userId || userId !== artisanId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const db = await connectMongo();

    const fields = {
      name: req.body.name,
      avatar: req.body.avatar,
      bio: req.body.bio,
      location: req.body.location,
    };

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(artisanId) }, { $set: fields });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;