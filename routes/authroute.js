const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../database/mongo");
const { ObjectId } = require("mongodb");

const router = express.Router();

function safeUser(u) {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role || "user", createdAt: u.createdAt };
}

router.get("/me", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.json({ authenticated: false });

    const db = getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      req.session.destroy(() => {});
      return res.json({ authenticated: false });
    }

    req.session.role = user.role || "user";
    return res.json({ authenticated: true, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection("users");

    const { name, email, password } = req.body;

  
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Unable to create account" });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanName.length < 2) return res.status(400).json({ error: "Unable to create account" });
    if (!cleanEmail.includes("@")) return res.status(400).json({ error: "Unable to create account" });
    if (String(password).length < 6) return res.status(400).json({ error: "Unable to create account" });

    const exists = await users.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ error: "Unable to create account" });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const createdAt = new Date();
    // All signups are normal users. Admin should be created/promoted by an existing admin.
    const doc = { name: cleanName, email: cleanEmail, role: "user", passwordHash, createdAt };

    const r = await users.insertOne(doc);

    req.session.userId = String(r.insertedId);
    req.session.role = "user";

    return res.status(201).json({ ok: true, user: { id: String(r.insertedId), name: cleanName, email: cleanEmail, role: "user", createdAt } });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection("users");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await users.findOne({ email: cleanEmail });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = String(user._id);
    req.session.role = user.role || "user";

    return res.json({ ok: true, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie("sid");
    return res.json({ ok: true });
  });
});

module.exports = router;
