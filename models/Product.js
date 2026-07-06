import mongoose from 'mongoose';
import './Category.js';
import './User.js';
import './Brand.js';


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  images: { type: [String], required: true },
  mainImage: { type: String, default: null },
  price: {
    type: Number,
    required: true,
    min: [0.5, 'Price must be at least 0.50 EGP'],
    set: val => Math.round(val * 100) / 100
  },
  discountPrice: { type: Number, min: 0 },
  priceEGP: { type: Number, min: 0 },
  priceSAR: { type: Number, min: 0 },
  priceAED: { type: Number, min: 0 },
  discountPriceEGP: { type: Number, min: 0 },
  discountPriceSAR: { type: Number, min: 0 },
  discountPriceAED: { type: Number, min: 0 },
  discountPercentage: { type: Number, min: 0, max: 100 },
  discountStartDate: { type: Date },
  discountEndDate: { type: Date },
  description: { type: String, required: true },
  sizes: { 
    type: [String], 
    default: [], 
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Sizes must be an array'
    }
  },
  colors: { 
    type: [String], 
    default: [], 
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Colors must be an array'
    }
  },
  countInStock: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  banner: { type: String },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
}, {
  timestamps: true 
});

productSchema.pre('save', function(next) {
  if (this.sizes && typeof this.sizes === 'string') {
    this.sizes = this.sizes.split(',').map(s => s.trim()).filter(s => s);
  }
  if (this.colors && typeof this.colors === 'string') {
    this.colors = this.colors.split(',').map(c => c.trim()).filter(c => c);
  }

  if (this.discountPercentage && this.discountPercentage > 0 && (!this.discountPrice || this.discountPrice === this.price)) {
    this.discountPrice = this.price * (1 - this.discountPercentage / 100);
    this.discountPrice = Math.round(this.discountPrice * 100) / 100;
  }

  if (this.discountPrice && this.discountPrice > 0 && this.discountPrice < this.price) {
    this.isOnSale = true;
  } else {
    this.isOnSale = false;
  }

  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
