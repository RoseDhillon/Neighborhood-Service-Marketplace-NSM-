const User = require("../models/User")

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: "Email already registered" })
    }

    const user = await User.create({ name, email, password, role })

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    req.session.userId = user._id.toString()
    req.session.role = user.role

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/logout
const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    res.clearCookie("connect.sid")
    res.status(200).json({ message: "Logged out successfully" })
  })
}

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, logout, me }
