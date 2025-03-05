import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // Discount percentage
  expiry: { type: Date, required: true }, // Expiry date of the coupon
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
