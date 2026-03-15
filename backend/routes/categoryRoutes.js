const express = require("express")
const router = express.Router()
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController")
const { requireAuth } = require("../middleware/auth")

router.post("/", requireAuth, createCategory)
router.get("/", getCategories)

module.exports = router
