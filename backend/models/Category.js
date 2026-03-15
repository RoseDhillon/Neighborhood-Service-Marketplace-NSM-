const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
)

// Unique index on name to prevent duplicate categories
categorySchema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model("Category", categorySchema)
