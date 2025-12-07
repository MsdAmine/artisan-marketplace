const express = require("express");
const { ObjectId } = require("mongodb");
const { connectMongo } = require("../db/mongo");
const auth = require("../middleware/auth");
const { createStreamClient } = require("../db/redis");
const { streamKeyForUser } = require("../utils/notificationStream");

const router = express.Router();

router.use(auth);

function getUserId(req) {
  return req.user?.id || req.headers["x-user-id"];
}

// GET /api/notifications/stream - live notifications via Redis Streams
router.get("/stream", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const streamKey = streamKeyForUser(userId);
    const streamClient = await createStreamClient();

    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.flushHeaders?.();

    let active = true;
    let lastId = req.headers["last-event-id"] || "$";

    req.on("close", () => {
      active = false;
      streamClient.quit();
    });

    async function poll() {
      while (active) {
        try {
          const response = await streamClient.xRead(
            { BLOCK: 20000, COUNT: 10 },
            { key: streamKey, id: lastId }
          );

          if (response?.length) {
            const messages = response[0].messages;

            for (const message of messages) {
              lastId = message.id;
              res.write(`id: ${message.id}\n`);
              res.write(`data: ${JSON.stringify(message.message)}\n\n`);
            }
          } else {
            res.write(`: keep-alive\n\n`);
          }
        } catch (err) {
          if (!active) return;
          console.error("Error streaming notifications", err);
          res.write("event: error\n");
          res.write("data: \"stream_error\"\n\n");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    poll().catch((err) => {
      console.error("Notification stream stopped", err);
    });
  } catch (err) {
    console.error("Error initializing notification stream", err);
    res.status(500).json({ error: "Failed to start notification stream" });
  }
});

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
