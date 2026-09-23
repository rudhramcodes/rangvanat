import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    collectionId: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. 'flora', 'sacred'
    name: { type: String, required: true, trim: true }, // e.g. 'The Flora Edit'
    mood: { type: String, required: true, trim: true },
    coverImage: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Collection = mongoose.model('Collection', collectionSchema);
