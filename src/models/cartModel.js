import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }
      }
    ],
    totalPrice: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export default function createCartModel() {
  return mongoose.model("Cart", cartSchema);
}
