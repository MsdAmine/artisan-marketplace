const express = require("express");
const router = express.Router();
const { connectMongo } = require("../db/mongo");
const { ObjectId } = require("mongodb");
const auth = require("../middleware/auth");

// All user routes require authentication
router.use(auth);

function getUserId(req) {
  return req.user?.id || req.headers["x-user-id"];
}

function normalizeUser(userDoc) {
  if (!userDoc) return null;

  const { _id, password, ...rest } = userDoc;
  return { id: String(_id), ...rest };
}

// GET /api/users/me  → return logged in user info
router.get("/me", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const db = await connectMongo();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(String(userId)) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(normalizeUser(user));
  } catch (err) {
    console.error("Error in GET /me:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// PUT /api/users/me → update logged in user profile info
router.put("/me", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const { name, phone, deliveryAddress, avatar } = req.body || {};

    const updates = {};

    if (typeof name === "string") {
      updates.name = name.trim();
    }

    if (typeof phone === "string") {
      updates.phone = phone.trim();
    }

    if (typeof avatar === "string") {
      updates.avatar = avatar.trim();
    }

    if (deliveryAddress && typeof deliveryAddress === "object") {
      const allowedAddressFields = ["street", "city", "postalCode", "country"];
      const sanitizedAddress = {};

      allowedAddressFields.forEach((field) => {
        if (deliveryAddress[field]) {
          sanitizedAddress[field] = String(deliveryAddress[field]).trim();
        }
      });

      updates.deliveryAddress = sanitizedAddress;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const db = await connectMongo();

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(String(userId)) },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!result.value) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(normalizeUser(result.value));
  } catch (err) {
    console.error("Error in PUT /me:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
