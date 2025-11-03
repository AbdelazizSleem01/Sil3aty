import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  size: String,
  color: String,
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  items: [cartItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
