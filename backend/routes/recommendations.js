const express = require("express");
const { recommendForUser } = require("../neo4j/recommend");
const { getDB } = require("../db/mongo");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const productIds = await recommendForUser(userId);

    const db = getDB();
    const mongoProducts = await db
      .collection("products")
      .find({ _id: { $in: productIds.map((id) => require("mongodb").ObjectId(id)) } })
      .toArray();

    res.json(mongoProducts);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

module.exports = router;
