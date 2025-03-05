import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin, isSeller } from "../middleware/roleMiddleware.js";
import Coupon from "../models/couponModel.js"; // Import coupon model

const router = express.Router();

// Get all products with pagination, sorting, and filtering
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", category, minPrice, maxPrice } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const products = await Product.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  })
);

// Get single product by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  })
);

// Create a new product (Only sellers and admins)
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

// Update a product (Only sellers and admins)
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
      res.status(404).json({ message: "Product not found" });
    }
  })
);

// Delete a product (Only admins)
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
      res.status(404).json({ message: "Product not found" });
    }
  })
);

// Search products by name
router.get(
  "/search/:query",
  asyncHandler(async (req, res) => {
    const searchQuery = req.params.query;
    const products = await Product.find({ name: { $regex: searchQuery, $options: "i" } });
    res.json(products);
  })
);

// Get top-rated products
router.get(
  "/top",
  asyncHandler(async (req, res) => {
    const topProducts = await Product.find({}).sort({ rating: -1 }).limit(5);
    res.json(topProducts);
  })
);

// Apply a coupon code at checkout (Fixed Expiry Check)
router.post(
  "/apply-coupon",
  protect,
  asyncHandler(async (req, res) => {
    const { code, totalAmount } = req.body;
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    if (new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const discountAmount = (coupon.discount / 100) * totalAmount;
    const discountedPrice = totalAmount - discountAmount;

    res.json({ success: true, discount: discountAmount, finalPrice: discountedPrice });
  })
);

// Create a coupon (Only sellers and admins)
router.post(
  "/create-coupon",
  protect,
  isSeller,
  asyncHandler(async (req, res) => {
    const { code, discount, expiry } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new Coupon({ code, discount, expiry });
    await coupon.save();

    res.status(201).json({ message: "Coupon created successfully", coupon });
  })
);

export default router;
