import express from "express";
import { generateToken } from "../utils/generateToken.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";  // ✅ Direct import

const router = express.Router();

// ✅ Get all users (Admin only)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    res.json(users);
  })
);

// ✅ Get user profile
router.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// ✅ Register a new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, isSeller } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      isSeller: isSeller || false 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isSeller: user.isSeller,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

// ✅ Login User
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isSeller: user.isSeller,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  })
);

// ✅ Update user profile
router.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isSeller: updatedUser.isSeller,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// ✅ Delete user (Admin only)
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

export default router;
