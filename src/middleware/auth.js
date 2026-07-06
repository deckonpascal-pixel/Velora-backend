import jwt from "jsonwebtoken";

// Attaches req.user if a valid user token is present. Used for optional identification (e.g. on order creation).
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      // ignore invalid token, treat as guest
    }
  }
  next();
}

// Requires a valid user token.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

// Requires a valid admin token (issued by /api/auth/admin-login).
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!payload.isAdmin) return res.status(403).json({ error: "Admin access required" });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  }
