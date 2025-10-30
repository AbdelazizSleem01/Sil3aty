import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: { type: String },
      color: { type: String },
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
  },
  tracking: {
    number: { type: String, unique: true },
    carrier: String,
    status: { 
      type: String, 
      enum: ['processing', 'shipped', 'in-transit', 'delivered', 'cancelled'],
      default: 'processing'
    },
    estimatedDelivery: Date,
    lastUpdated: Date
  },
  paymentMethod: { type: String },
  shippingAddress: {
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  status: { type: String, default: 'processing' },
}, { timestamps: true });
export default mongoose.models.Order || mongoose.model('Order', orderSchema);