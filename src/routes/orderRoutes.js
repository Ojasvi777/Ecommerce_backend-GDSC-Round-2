import express from "express";
import asyncHandler from "express-async-handler";
//import Order from "../models/orderModel.js";
import createOrderModel from "../models/orderModel.js";
import {protect} from "../middleware/authMiddleware.js";
const Order = createOrderModel();
const router = express.Router();

// Create new order
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  })
);

// Get all orders for logged-in user
router.get(
  "/myorders",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  })
);

// Get order by ID
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  })
);

export default router;
