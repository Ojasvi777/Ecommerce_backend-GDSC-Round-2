import express from "express";
import asyncHandler from "express-async-handler";
import createProductModel from "../models/productModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin, isSeller } from "../middleware/roleMiddleware.js";

const Product = createProductModel(); // ✅ Initialize the Product model

const router = express.Router();

// ✅ Get all products with filtering
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const products = await Product.find(filter);
    res.json(products);
  })
);

// ✅ Get single product by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);

// ✅ Create a new product (Only sellers and admins)
router.post(
  "/",
  protect,
  isSeller,
  asyncHandler(async (req, res) => {
    const { name, description, price, category, stock, image } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  })
);

// ✅ Update a product (Only sellers and admins)
router.put(
  "/:id",
  protect,
  isSeller,
  asyncHandler(async (req, res) => {
    const { name, description, price, category, stock, image } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock || product.stock;
      product.image = image || product.image;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);

// ✅ Delete a product (Only admins)
router.delete(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);

// ✅ Search products by name
router.get(
  "/search/:query",
  asyncHandler(async (req, res) => {
    const searchQuery = req.params.query;
    const products = await Product.find({ name: { $regex: searchQuery, $options: "i" } });
    res.json(products);
  })
);

// ✅ Get top-rated products
router.get(
  "/top",
  asyncHandler(async (req, res) => {
    const topProducts = await Product.find({}).sort({ rating: -1 }).limit(5);
    res.json(topProducts);
  })
);

export default router;
