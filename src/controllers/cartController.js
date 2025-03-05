import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

/**
 * @desc Add product to cart
 * @route POST /api/cart/add
 * @access Private (Buyer Only)
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be at least 1.");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (quantity > product.stock) {
    res.status(400);
    throw new Error("Not enough stock available.");
  }

  const cartItem = user.cart.find((item) => item.product.toString() === productId);
  if (cartItem) {
    if (cartItem.quantity + quantity > product.stock) {
      res.status(400);
      throw new Error("Adding this many exceeds available stock.");
    }
    cartItem.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  res.json(user.cart);
});

/**
 * @desc Get user's cart
 * @route GET /api/cart
 * @access Private (Buyer Only)
 */
export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.product");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json(user.cart);
});

/**
 * @desc Remove product from cart
 * @route DELETE /api/cart/remove/:productId
 * @access Private (Buyer Only)
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const itemIndex = user.cart.findIndex((item) => item.product.toString() === req.params.productId);
  if (itemIndex === -1) {
    res.status(400);
    throw new Error("Item not found in cart.");
  }

  user.cart.splice(itemIndex, 1);
  await user.save();
  res.json(user.cart);
});

/**
 * @desc Checkout (deduct balance, update stock, and clear cart)
 * @route POST /api/cart/checkout
 * @access Private (Buyer Only)
 */
export const checkout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.product");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  let totalPrice = 0;
  for (let item of user.cart) {
    if (!item.product) {
      res.status(400);
      throw new Error("Some products in cart are no longer available.");
    }

    if (item.quantity > item.product.stock) {
      res.status(400);
      throw new Error(`Not enough stock for ${item.product.name}.`);
    }

    totalPrice += item.product.price * item.quantity;
  }

  if (user.balance < totalPrice) {
    res.status(400);
    throw new Error("Insufficient balance.");
  }

  // Deduct stock
  for (let item of user.cart) {
    const product = await Product.findById(item.product._id);
    product.stock -= item.quantity;
    await product.save();
  }

  // Deduct balance and clear cart
  user.balance -= totalPrice;
  user.cart = [];
  await user.save();

  res.json({ message: "Checkout successful", balance: user.balance });
});
