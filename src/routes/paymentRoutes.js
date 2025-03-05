import express from "express";
const router = express.Router();

// Example Route
router.post("/", (req, res) => {
  res.json({ message: "Payment route" });
});

export default router;
