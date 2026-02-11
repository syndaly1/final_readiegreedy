const { ObjectId } = require("mongodb");
const { getDb } = require("../database/mongo");

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: "Unauthorized" });
}


async function attachUser(req, res, next) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      req.user = null;
      return next();
    }

    if (!ObjectId.isValid(userId)) {
      req.session.destroy(() => {});
      req.user = null;
      return next();
    }

    const db = getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { passwordHash: 0 } });

    if (!user) {
      req.session.destroy(() => {});
      req.user = null;
      return next();
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      createdAt: user.createdAt,
    };
    req.session.role = req.user.role;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });

    if (req.session?.role === role) return next();

    await attachUser(req, res, () => {
      if (req.user?.role === role) return next();
      return res.status(403).json({ error: "Forbidden" });
    });
  };
}

const requireAdmin = requireRole("admin");

module.exports = { requireAuth, attachUser, requireRole, requireAdmin };
