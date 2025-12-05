const express = require("express");
const { ObjectId } = require("mongodb");
const { connectMongo } = require("../db/mongo");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

function getUserId(req) {
  return req.user?.id || req.headers["x-user-id"];
}

// GET /api/notifications - fetch notifications for the connected user
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const db = await connectMongo();

    const notifications = await db
      .collection("notifications")
      .find({ userId: String(userId) })
      .sort({ read: 1, createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/mark-all-read - mark all as read for the user
router.patch("/mark-all-read", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const db = await connectMongo();

    const result = await db.collection("notifications").updateMany(
      { userId: String(userId), read: false },
      { $set: { read: true } }
    );

    res.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error("Error marking notifications as read", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// PATCH /api/notifications/:id/read - mark a single notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid notification id" });
    }

    const db = await connectMongo();

    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(id), userId: String(userId) },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error("Error updating notification", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

module.exports = router;
