const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

const { followArtisan, unfollowArtisan, getArtisanStats } = require("../neo4j/actions"); 

// --- UTILITY TO GET USER ID FOR STATS CHECK ---
function getCurrentUserId(req) {
    // Looks for user ID in query (for profile view) or body (for follow action)
    // NOTE: In a secure app, the user ID should come from a middleware (e.g., JWT)
    return req.query.userId || req.body.userId || null;
}

// ===============================================
// ARTISAN PROFILE AND FOLLOW ROUTES
// (Mounted at /api/artisans)
// ===============================================

// ---------------------------------------
// GET Artisan Profile Data (Main Profile View)
// ---------------------------------------
router.get("/:artisanId/profile", async (req, res) => {
    try {
        const artisanId = req.params.artisanId;
        const currentUserId = getCurrentUserId(req);

        const db = await connectMongo();

        // 1. Get Basic Info from MongoDB (User collection)
        // Ensure artisanId is converted to ObjectId if necessary for your 'users' collection lookup
        const artisan = await db
            .collection("users")
            .findOne({ _id: new ObjectId(artisanId) }, { projection: { password: 0 } });
        
        if (!artisan) {
            return res.status(404).json({ error: "Artisan not found" });
        }

        // 2. Get Products from MongoDB (Products collection)
        // Find products where artisanId is stored as a string
        const products = await db
            .collection("products")
            .find({ artisanId: artisanId }) 
            .toArray();

        // 3. Get Stats from Neo4j (Followers & Following status)
        const driver = req.app.locals.neo4jDriver; // Assuming driver is attached to app.locals
        let stats = { followers: 0, isFollowing: false };

        if (driver) {
           // Pass the IDs to Neo4j actions
           stats = await getArtisanStats(driver, artisanId, currentUserId);
        }

        res.json({
            artisan,
            products,
            stats
        });

    } catch (err) {
        console.error("Error fetching artisan profile:", err);
        res.status(500).json({ error: "Server error fetching profile", details: err.message });
    }
});

// ---------------------------------------
// POST Follow Artisan
// ---------------------------------------
router.post("/:artisanId/follow", async (req, res) => {
    const userId = getCurrentUserId(req); // The user who is following
    const artisanId = req.params.artisanId;
    const driver = req.app.locals.neo4jDriver;

    if (!driver || !userId) {
        return res.status(400).json({ error: "Missing driver or user ID" });
    }

    try {
        await followArtisan(driver, userId, artisanId);
        res.json({ success: true, action: "followed" });
    } catch (err) {
        console.error("Failed to follow artisan:", err);
        res.status(500).json({ error: "Failed to follow artisan" });
    }
});

// ---------------------------------------
// POST Unfollow Artisan
// ---------------------------------------
router.post("/:artisanId/unfollow", async (req, res) => {
    const userId = getCurrentUserId(req); // The user who is unfollowing
    const artisanId = req.params.artisanId;
    const driver = req.app.locals.neo4jDriver;

    if (!driver || !userId) {
        return res.status(400).json({ error: "Missing driver or user ID" });
    }

    try {
        await unfollowArtisan(driver, userId, artisanId);
        res.json({ success: true, action: "unfollowed" });
    } catch (err) {
        console.error("Failed to unfollow artisan:", err);
        res.status(500).json({ error: "Failed to unfollow artisan" });
    }
});

module.exports = router;