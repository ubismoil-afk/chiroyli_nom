const { verifyAccessToken } = require("../utils/tokens");
const Product = require("../models/Product");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Lets admins do anything, but regular users can only touch products they created.
async function requereOwner(req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (product.createdBy.toString() !== req.user.sub) {
    return res.status(403).json({ error: "You don't own this product" });
  }

  next();
}

module.exports = { requireAuth, requireAdmin, requereOwner };
