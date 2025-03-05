import mongoose from "mongoose";

export default function createOrderModel() {
    const orderSchema = new mongoose.Schema(
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            orderItems: [
                {
                    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                    quantity: { type: Number, required: true },
                },
            ],
            totalPrice: { type: Number, required: true },
            isPaid: { type: Boolean, default: false },
            paidAt: { type: Date },
            isDelivered: { type: Boolean, default: false },
            deliveredAt: { type: Date },
        },
        { timestamps: true }
    );

    return mongoose.model("Order", orderSchema);
}
