const express = require("express")
const router = express.Router()
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
} = require("../controllers/requestController")
const { requireAuth, requireRole } = require("../middleware/auth")

router.post("/", requireAuth, requireRole("resident"), createRequest)
router.get("/", requireAuth, getRequests)
router.get("/:id", requireAuth, getRequestById)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("resident"),
  updateRequestStatus,
)

module.exports = router
