import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'كود الكوبون مطلوب'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    required: [true, 'نوع الخصم مطلوب'],
    enum: {
      values: ['percent', 'fixed', 'free-shipping'],
      message: 'نوع الخصم يجب أن يكون: percent، fixed، أو free-shipping'
    }
  },
  amount: {
    type: Number,
    required: [true, 'مبلغ الخصم مطلوب'],
    min: [0, 'مبلغ الخصم لا يمكن أن يكون أقل من 0']
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'الحد الأدنى للطلب لا يمكن أن يكون أقل من 0']
  },
  maxDiscount: {
    type: Number,
    default: null 
  },
  expiryDate: {
    type: Date,
    required: [true, 'تاريخ الانتهاء مطلوب']
  },
  usageLimit: {
    type: Number,
    default: null, 
    min: [0, 'حد الاستخدام لا يمكن أن يكون أقل من 0']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'عدد الاستخدام لا يمكن أن يكون أقل من 0']
  },
  active: {
    type: Boolean,
    default: true
  },
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], 
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }] 
}, {
  timestamps: true
});


couponSchema.index({ active: 1, expiryDate: 1 });

couponSchema.virtual('canBeUsed').get(function() {
  const now = new Date();
  return (
    this.active &&
    this.expiryDate >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

couponSchema.methods.isValidForUser = function(userId) {
  if (this.applicableUsers.length === 0) return true;
  return this.applicableUsers.includes(userId);
};

couponSchema.methods.appliesToProducts = function(productIds) {
  if (this.applicableProducts.length === 0) return true;
  return productIds.some(productId => this.applicableProducts.includes(productId));
};

couponSchema.methods.calculateDiscount = function(orderTotal, shippingCost = 0) {
  if (this.discountType === 'free-shipping') {
    return {
      discountAmount: shippingCost,
      discountType: 'shipping'
    };
  }

  let discountAmount = 0;

  if (this.discountType === 'percent') {
    discountAmount = Math.round((this.amount / 100) * orderTotal * 100) / 100;
  } else if (this.discountType === 'fixed') {
    discountAmount = this.amount;
  }

  if (this.maxDiscount !== null && discountAmount > this.maxDiscount) {
    discountAmount = this.maxDiscount;
  }

  return {
    discountAmount,
    discountType: this.discountType
  };
};

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
