import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isBuyer } from "../middleware/roleMiddleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
} from "../controllers/cartController.js";

const router = express.Router();

// ✅ Add item to cart
router.post("/add", protect, isBuyer, addToCart);

// ✅ Get cart details
router.get("/", protect, isBuyer, getCart);

// ✅ Remove item from cart
router.delete("/remove/:productId", protect, isBuyer, removeFromCart);

// ✅ Checkout (deduct balance, clear cart)
router.post("/checkout", protect, isBuyer, checkout);

export default router;
