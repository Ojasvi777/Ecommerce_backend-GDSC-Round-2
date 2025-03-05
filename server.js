import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./src/config/database.js";

// Import Models & Routes
import Product from "./src/models/productModel.js";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for frontend communication

// Serve the frontend (index.html)
const __dirname = path.resolve();
app.use(express.static(__dirname)); // Serve static files from the same directory

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Test Route: Fetch All Products (for Testing Backend Connection)
app.get("/test/products", async (req, res) => {
  try {
    const products = await Product.find();
    console.log("✅ Products Retrieved:", products);
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
