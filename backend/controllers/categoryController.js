const Category = require("../models/Category")

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Category name is required" })
    }

    const category = await Category.create({ name, description })
    res.status(201).json({ message: "Category created", category })
  } catch (err) {
    next(err)
  }
}

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json({ categories })
  } catch (err) {
    next(err)
  }
}

module.exports = { createCategory, getCategories }
