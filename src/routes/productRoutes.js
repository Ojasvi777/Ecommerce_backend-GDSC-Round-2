import express from "express";
import asyncHandler from "express-async-handler";
import createProductModel from "../models/productModel.js";

const Product = createProductModel(); // ✅ Initialize the Product model

const router = express.Router();

// Get all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
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
      res.status(404);
      throw new Error("Product not found");
    }
  })
);

// Create a new product (Admin only)
router.post(
  "/",
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

// Update a product (Admin only)
router.put(
  "/:id",
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

// Delete a product (Admin only)
router.delete(
  "/:id",
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

export default router;
