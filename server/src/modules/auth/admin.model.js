import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'manager'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

export const AdminUser = mongoose.model('AdminUser', adminUserSchema);
