import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
});

const Webhook = mongoose.model("Webhook", webhookSchema);
export default Webhook;
