const { ObjectId } = require("mongodb");
const { getDb } = require("../database/mongo");

/**
 * Requires the user to be authenticated (session-based).
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

/**
 * Loads the current user from DB and attaches it to req.user.
 * Also keeps req.session.role in sync for convenience.
 */
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

/**
 * Requires a specific role (e.g., 'admin').
 */
function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });

    // Fast path if role is already in session.
    if (req.session?.role === role) return next();

    // Otherwise load user to confirm.
    await attachUser(req, res, () => {
      if (req.user?.role === role) return next();
      return res.status(403).json({ error: "Forbidden" });
    });
  };
}

const requireAdmin = requireRole("admin");

module.exports = { requireAuth, attachUser, requireRole, requireAdmin };
