import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 1 },
    minCartValue: { type: Number, default: 0 },
    maxDiscountCap: { type: Number, default: null },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    timesUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
