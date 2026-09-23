import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productTitle: { type: String, required: true },
  image: { type: String, default: '' },
  variantSize: { type: String, required: true },
  customMeasurements: {
    bust: String,
    waist: String,
    hip: String,
    height: String,
    notes: String,
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      shippingAddress: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
      },
    },
    items: [orderItemSchema],
    financials: {
      subtotal: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String, default: null },
      shippingFee: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    payment: {
      gateway: { type: String, default: 'razorpay' },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      paidAt: { type: Date },
    },
    fulfillment: {
      status: {
        type: String,
        enum: ['received', 'in_stitching', 'dispatched', 'delivered', 'cancelled'],
        default: 'received',
        index: true,
      },
      courierPartner: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      dispatchedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    invoiceUrl: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
