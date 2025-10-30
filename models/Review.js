import mongoose from 'mongoose';
import './Product.js';
import './User.js';


const reviewSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    default: 1
  },
  comment: { type: String, required: true },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
