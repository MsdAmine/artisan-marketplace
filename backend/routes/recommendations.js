// backend/routes/recommendations.js

const express = require("express");
const router = express.Router();

const { trackInteraction } = require("../neo4j/actions");
const { recommendForUser } = require("../neo4j/recommend");

// POST /api/recommendations/track
router.post("/track", async (req, res) => {
  try {
    const driver = req.neo4jDriver; // <--- ACCESS THE AUTHENTICATED DRIVER
    if (!driver)
      return res.status(500).json({ error: "Neo4j connection not ready" });

    const { userId, productId, action } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId required" });
    }

    // FIX: Pass the driver instance as the first argument
    await trackInteraction(driver, userId, productId, action || "view");
    res.json({ message: "Interaction tracked" });
  } catch (err) {
    console.error("TRACK ERROR", err);
    res.status(500).json({ error: "Tracking failed" });
  }
});

// GET /api/recommendations/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const driver = req.neo4jDriver; // <--- ACCESS THE AUTHENTICATED DRIVER
    if (!driver)
      return res.status(500).json({ error: "Neo4j connection not ready" });

    // FIX: Pass the driver instance as the first argument
    const products = await recommendForUser(driver, userId, 10);
    res.json({ products });
  } catch (err) {
    console.error("RECOMMEND ERROR", err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});

module.exports = router;
