const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

let client;
let db;

async function connectMongo() {
  if (db) return db;
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MongoDB URI. Set MONGO_URI (required) in env.");
  }

  const dbName = process.env.MONGODB_DB || "readieg_library";

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);

  await db.collection("books").createIndex({ title: 1 });
  await db.collection("books").createIndex({ author: 1 });
  await db.collection("books").createIndex({ tags: 1 });
  await db.collection("books").createIndex({ series: 1, seriesNumber: 1 });

  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  // Optional: bootstrap an initial admin user using env vars.
  await ensureAdminFromEnv(db);

  return db;
}

async function ensureAdminFromEnv(dbInstance) {
  try {
    const dbToUse = dbInstance || db;
    if (!dbToUse) return;

    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "");
    const name = String(process.env.ADMIN_NAME || "Admin").trim() || "Admin";

    // If not configured, do nothing.
    if (!email || !password) return;

    const users = dbToUse.collection("users");
    const existing = await users.findOne({ email });

    if (existing) {
      if ((existing.role || "user") !== "admin") {
        await users.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await users.insertOne({
      name,
      email,
      role: "admin",
      passwordHash,
      createdAt: new Date(),
    });
  } catch (err) {
    // Don't crash the app for this. Just log.
    console.error("Admin bootstrap failed:", err?.message || err);
  }
}

function getDb() {
  if (!db) throw new Error("MongoDB is not connected yet.");
  return db;
}

async function closeMongo() {
  if (client) await client.close();
  client = null;
  db = null;
}

module.exports = { connectMongo, getDb, closeMongo, ensureAdminFromEnv };
