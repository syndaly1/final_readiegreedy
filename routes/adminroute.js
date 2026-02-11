const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../database/mongo");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Admin: list users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const users = await db
      .collection("users")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    res.json(
      users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role || "user",
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: set a user's role
router.put("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user id" });
    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role" });
    }

    const db = getDb();
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: { role } });

    if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
