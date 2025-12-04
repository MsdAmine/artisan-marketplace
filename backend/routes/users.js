const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");

// GET /api/users/me  → return logged in user info
router.get("/me", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]; // TEMP AUTH

    if (!userId) {
      return res.status(401).json({ error: "Missing x-user-id header" });
    }

    const db = await connectMongo();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in GET /me:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
