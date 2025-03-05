import express from "express";
import Cart from "../models/cartModel.js"; 
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// ✅ Get User's Cart (Protected)
router.get("/:userId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add Item to Cart (Protected)
router.post("/", protect, async (req, res) => {
  const { userId, productId, name, price, quantity, image } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, cartItems: [], totalPrice: 0 });
    }

    const existingItem = cart.cartItems.find((item) => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.cartItems.push({ productId, name, price, quantity, image });
    }

    cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Remove Item from Cart (Protected)
router.delete("/:userId/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.cartItems = cart.cartItems.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.cartItems.length === 0) {
      await Cart.deleteOne({ _id: cart._id }); // ✅ Delete empty cart
      return res.json({ message: "Cart is empty now" });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
