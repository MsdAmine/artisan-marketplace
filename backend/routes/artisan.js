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

    // 2️⃣ Fetch artisan products
    const products = await db
      .collection("products")
      .find({ artisanId: artisanId }) // artisanId stored as STRING
      .toArray();

    // 3️⃣ Fetch Neo4j stats
    const driver = req.neo4jDriver;
    let stats = { followers: 0, isFollowing: false };

    if (driver) {
      stats = await getArtisanStats(driver, artisanId, currentUserId);
    }

    // 4️⃣ Respond with profile
    res.json({ artisan, products, stats });
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
// UPDATE ARTISAN PROFILE  →  PUT /api/artisans/:id
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
