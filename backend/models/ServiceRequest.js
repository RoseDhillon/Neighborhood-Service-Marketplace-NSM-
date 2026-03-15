const mongoose = require("mongoose")

const serviceRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "quoted", "assigned", "completed", "cancelled"],
        message: "Invalid status value",
      },
      default: "open",
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
)

// Text index on title and description for keyword search (mandatory)
serviceRequestSchema.index({ title: "text", description: "text" })

// Compound index on status + category for common filter queries (mandatory)
serviceRequestSchema.index({ status: 1, category: 1 })

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema)
