import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

/**
 * @desc Get all products with pagination, sorting, and filtering
 * @route GET /api/products
 * @access Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, sort, category, price } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  let query = {};

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (price) {
    query.price = {};
    if (price.min) query.price.$gte = Number(price.min);
    if (price.max) query.price.$lte = Number(price.max);
  }

  // Sorting logic
  let sortOptions = {};
  if (sort === "price_asc") sortOptions.price = 1;
  if (sort === "price_desc") sortOptions.price = -1;
  if (sort === "newest") sortOptions.createdAt = -1;

  // Get total count for pagination metadata
  const totalProducts = await Product.countDocuments(query);

  // Fetch products with filters, sorting, and pagination
  const products = await Product.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
    totalProducts,
  });
});
