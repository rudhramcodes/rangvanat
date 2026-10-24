import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tokenVersion: {type:Number,default:0},
    emailVerifiedAt: Date,
    resetHash: String, resetExpires: Date,
    verificationHash: String, verificationExpires: Date,
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '', trim: true },
    addresses: [addressSchema],
    wishlist: [{ type: String }], // product slugs or ids
    role: { type: String, default: 'customer' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

export const Customer = mongoose.model('Customer', customerSchema);
