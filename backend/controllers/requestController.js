const mongoose = require("mongoose")
const ServiceRequest = require("../models/ServiceRequest")

// POST /api/requests
const createRequest = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body

    if (!title || !description || !category || !location) {
      return res
        .status(400)
        .json({
          message: "title, description, category, and location are required",
        })
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" })
    }

    const request = await ServiceRequest.create({
      title,
      description,
      category,
      location,
      resident: req.session.userId,
    })

    await request.populate(["category", "resident"])
    res.status(201).json({ message: "Request created", request })
  } catch (err) {
    next(err)
  }
}

// GET /api/requests
const getRequests = async (req, res, next) => {
  try {
    const { status, categoryId, q } = req.query
    const filter = {}

    if (status) {
      const validStatuses = [
        "open",
        "quoted",
        "assigned",
        "completed",
        "cancelled",
      ]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" })
      }
      filter.status = status
    }

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" })
      }
      filter.category = categoryId
    }

    if (q) {
      // Use MongoDB text index for keyword search
      filter.$text = { $search: q }
    }

    const requests = await ServiceRequest.find(filter)
      .populate("category", "name")
      .populate("resident", "name email")
      .populate("assignedProvider", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({ requests })
  } catch (err) {
    next(err)
  }
}

// GET /api/requests/:id
const getRequestById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" })
    }

    const request = await ServiceRequest.findById(req.params.id)
      .populate("category", "name")
      .populate("resident", "name email")
      .populate("assignedProvider", "name email")

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    res.status(200).json({ request })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/requests/:id/status
const updateRequestStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" })
    }

    const { status } = req.body
    const validStatuses = [
      "open",
      "quoted",
      "assigned",
      "completed",
      "cancelled",
    ]

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Valid status is required" })
    }

    const request = await ServiceRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Only the resident who owns the request can update its status
    if (request.resident.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not own this request" })
    }

    // Enforce valid transitions
    const allowedTransitions = {
      open: ["cancelled"],
      quoted: ["cancelled"],
      assigned: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    }

    if (!allowedTransitions[request.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${request.status}' to '${status}'`,
      })
    }

    request.status = status
    await request.save()

    res.status(200).json({ message: "Status updated", request })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
}
