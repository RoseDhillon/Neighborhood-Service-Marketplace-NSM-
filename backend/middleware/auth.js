// Verify the user has an active session
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized: please log in" })
  }
  next()
}

// Verify the user has one of the allowed roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: please log in" })
    }
    if (!roles.includes(req.session.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }
