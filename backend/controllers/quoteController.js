const mongoose = require("mongoose")
const Quote = require("../models/Quote")
const ServiceRequest = require("../models/ServiceRequest")

// POST /api/quotes
const submitQuote = async (req, res, next) => {
  try {
    const { requestId, price, daysToComplete, message } = req.body

    if (!requestId || price === undefined || !daysToComplete) {
      return res
        .status(400)
        .json({ message: "requestId, price, and daysToComplete are required" })
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" })
    }

    if (typeof price !== "number" || price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" })
    }

    if (
      typeof daysToComplete !== "number" ||
      daysToComplete < 1 ||
      daysToComplete > 365
    ) {
      return res
        .status(400)
        .json({ message: "daysToComplete must be between 1 and 365" })
    }

    const request = await ServiceRequest.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (!["open", "quoted"].includes(request.status)) {
      return res
        .status(400)
        .json({
          message: "Quotes can only be submitted for open or quoted requests",
        })
    }

    // Check for duplicate quote from same provider
    const existing = await Quote.findOne({
      request: requestId,
      provider: req.session.userId,
    })
    if (existing) {
      return res
        .status(409)
        .json({
          message: "You have already submitted a quote for this request",
        })
    }

    const quote = await Quote.create({
      request: requestId,
      provider: req.session.userId,
      price,
      daysToComplete,
      message,
    })

    // Transition request to 'quoted' if it was still 'open'
    if (request.status === "open") {
      request.status = "quoted"
      await request.save()
    }

    await quote.populate("provider", "name email")
    res.status(201).json({ message: "Quote submitted", quote })
  } catch (err) {
    next(err)
  }
}

// GET /api/quotes?requestId=...
const getQuotesByRequest = async (req, res, next) => {
  try {
    const { requestId } = req.query

    if (!requestId) {
      return res
        .status(400)
        .json({ message: "requestId query param is required" })
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" })
    }

    const request = await ServiceRequest.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Residents can only view quotes on their own requests
    if (
      req.session.role === "resident" &&
      request.resident.toString() !== req.session.userId
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not own this request" })
    }

    const quotes = await Quote.find({ request: requestId })
      .populate("provider", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({ quotes })
  } catch (err) {
    next(err)
  }
}

// GET /api/quotes/my
const getMyQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ provider: req.session.userId })
      .populate({
        path: "request",
        populate: [
          { path: "category", select: "name" },
          { path: "resident", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 })

    res.status(200).json({ quotes })
  } catch (err) {
    next(err)
  }
}

// POST /api/quotes/:id/accept
const acceptQuote = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quote ID" })
    }

    const quote = await Quote.findById(req.params.id)
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" })
    }

    // Idempotency: reject repeated accept attempts
    if (quote.status === "accepted") {
      return res
        .status(409)
        .json({ message: "This quote has already been accepted" })
    }

    const request = await ServiceRequest.findById(quote.request)
    if (!request) {
      return res.status(404).json({ message: "Associated request not found" })
    }

    // Only the resident who owns the request can accept a quote
    if (request.resident.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not own this request" })
    }

    // Request must be in a state that allows quote acceptance
    if (!["open", "quoted"].includes(request.status)) {
      return res.status(400).json({
        message: `Cannot accept a quote on a request with status '${request.status}'`,
      })
    }

    // Atomically: accept selected quote, reject all others, assign request
    await Quote.updateMany(
      { request: quote.request, _id: { $ne: quote._id } },
      { $set: { status: "rejected" } },
    )

    quote.status = "accepted"
    await quote.save()

    request.status = "assigned"
    request.assignedProvider = quote.provider
    await request.save()

    await quote.populate("provider", "name email")
    res.status(200).json({ message: "Quote accepted", quote, request })
  } catch (err) {
    next(err)
  }
}

module.exports = { submitQuote, getQuotesByRequest, getMyQuotes, acceptQuote }
