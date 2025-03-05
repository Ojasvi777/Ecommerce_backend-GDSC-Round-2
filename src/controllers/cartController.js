import asyncHandler from "express-async-handler";
import axios from "axios";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Webhook from "../models/webhookModel.js";

// Add product to cart
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

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.product");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json(user.cart);
});

// Remove product from cart
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

// Checkout (deduct balance, update stock, and clear cart)
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

  // Send webhook notification if registered
  const webhook = await Webhook.findOne({ user: req.user.id });
  if (webhook) {
    try {
      await axios.post(webhook.url, {
        event: "checkout_complete",
        message: "Your checkout was successful",
        balance: user.balance,
      });
    } catch (error) {
      console.error("Webhook failed:", error.message);
    }
  }

  res.json({ message: "Checkout successful", balance: user.balance });
});
