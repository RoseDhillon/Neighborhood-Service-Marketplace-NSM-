const mongoose = require("mongoose")

const quoteSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: [true, "Request reference is required"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider reference is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    daysToComplete: {
      type: Number,
      required: [true, "Days to complete is required"],
      min: [1, "Days to complete must be at least 1"],
      max: [365, "Days to complete cannot exceed 365"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Invalid quote status",
      },
      default: "pending",
    },
  },
  { timestamps: true },
)

// Mandatory index on request for efficient quote lookups by request
quoteSchema.index({ request: 1 })

// Recommended index on provider for "My Quotes" page
quoteSchema.index({ provider: 1 })

// Prevent a provider from submitting duplicate quotes on the same request
quoteSchema.index({ request: 1, provider: 1 }, { unique: true })

module.exports = mongoose.model("Quote", quoteSchema)
