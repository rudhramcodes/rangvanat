import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'
  sku: { type: String, required: true },
  priceDelta: { type: Number, default: 0 },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isInteger,
  },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    collectionId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    description: { type: String, required: true },
    heritageCraftStory: { type: String, default: "" },
    fabric: { type: String, default: "Khadi" },
    craft: { type: String, default: "" },
    sizeGuide: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    madeToOrder: { type: Boolean, default: false },
    washCare: { type: String, default: "Dry Clean Only" },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        alt: { type: String, default: "" },
      },
    ],
    variants: [variantSchema],
    salesPaused: { type: Boolean, default: false },
    totalStock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    leadTimeDays: { type: Number, default: 7 },
  },
  { timestamps: true, optimisticConcurrency: true },
);

// Auto-compute totalStock from variants before save
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
