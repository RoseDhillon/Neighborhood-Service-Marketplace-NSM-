const express = require("express")
const router = express.Router()
const {
  submitQuote,
  getQuotesByRequest,
  getMyQuotes,
  acceptQuote,
} = require("../controllers/quoteController")
const { requireAuth, requireRole } = require("../middleware/auth")

router.post("/", requireAuth, requireRole("provider"), submitQuote)
router.get("/", requireAuth, getQuotesByRequest)
router.get("/my", requireAuth, requireRole("provider"), getMyQuotes)
router.post("/:id/accept", requireAuth, requireRole("resident"), acceptQuote)

module.exports = router
