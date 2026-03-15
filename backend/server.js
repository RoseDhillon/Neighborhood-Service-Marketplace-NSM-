require("dotenv").config()
const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const connectDB = require("./config/db")
const errorHandler = require("./middleware/errorHandler")

const authRoutes = require("./routes/authRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const requestRoutes = require("./routes/requestRoutes")
const quoteRoutes = require("./routes/quoteRoutes")

const app = express()

// Connect to MongoDB
connectDB()

// CORS — allow Angular dev server with credentials
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:4200",
    credentials: true,
  }),
)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/requests", requestRoutes)
app.use("/api/quotes", quoteRoutes)

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
