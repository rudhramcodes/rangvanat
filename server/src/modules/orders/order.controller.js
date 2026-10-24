import { Order } from './order.model.js';
import { Product } from '../products/product.model.js';
import { Coupon } from '../coupons/coupon.model.js';

export const createOrder = async (req, res, next) => {
  try {
    const { customer, items, financials, paymentMethod = 'card' } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer details are required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Generate Order Number: RV-2026-XXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `RV-${new Date().getFullYear()}-${randomSuffix}`;

    // Calculate or verify financials
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let product = null;
      if (item.productId && item.productId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(item.productId);
      }
      if (!product && item.slug) {
        product = await Product.findOne({ slug: item.slug });
      }

      const unitPrice = product ? product.price : (item.unitPrice || item.price || 0);
      const lineSubtotal = unitPrice * (item.quantity || 1);
      subtotal += lineSubtotal;

      validatedItems.push({
        productId: product ? product._id : '000000000000000000000000',
        productTitle: item.title || (product ? product.title : 'Handcrafted Khadi Piece'),
        image: item.image || (product && product.images && product.images[0]?.url) || '',
        variantSize: item.variantSize || item.size || 'Standard',
        customMeasurements: item.customMeasurements || {},
        quantity: item.quantity || 1,
        unitPrice,
        subtotal: lineSubtotal,
      });
    }

    let discountAmount = financials?.discountAmount || 0;
    let couponCode = financials?.couponCode || null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });
      if (coupon && subtotal >= coupon.minCartValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountCap) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { timesUsed: 1 } });
      } else {
        couponCode = null;
        discountAmount = 0;
      }
    }

    const shippingFee = subtotal > 15000 || subtotal === 0 ? 0 : 500;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const newOrder = new Order({
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        shippingAddress: {
          addressLine1: customer.shippingAddress?.addressLine1 || 'Studio Address',
          addressLine2: customer.shippingAddress?.addressLine2 || '',
          city: customer.shippingAddress?.city || 'Bardoli',
          state: customer.shippingAddress?.state || 'Gujarat',
          pincode: customer.shippingAddress?.pincode || '394601',
          country: customer.shippingAddress?.country || 'India',
        },
      },
      items: validatedItems,
      financials: {
        subtotal,
        discountAmount,
        couponCode,
        shippingFee,
        taxAmount: 0,
        totalAmount,
      },
      payment: {
        gateway: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        paidAt: paymentMethod !== 'cod' ? new Date() : null,
      },
      fulfillment: {
        status: 'received',
        courierPartner: 'BlueDart Luxury Express',
        trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
      },
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, contact } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required' });
    }

    const query = { orderNumber: orderNumber.trim().toUpperCase() };
    if (contact && contact.trim()) {
      const trimmed = contact.trim().toLowerCase();
      query.$or = [{ 'customer.email': trimmed }, { 'customer.phone': trimmed }];
    }

    const order = await Order.findOne(query).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found matching the provided details. Please verify your order number.',
      });
    }

    // Build timeline details
    const steps = [
      { key: 'received', label: 'Order Confirmed', date: order.createdAt, done: true },
      {
        key: 'in_stitching',
        label: 'In Studio Loom & Stitching',
        date: order.createdAt,
        done: ['in_stitching', 'dispatched', 'delivered'].includes(order.fulfillment.status),
      },
      {
        key: 'dispatched',
        label: 'Handloom Packed & Dispatched',
        date: order.fulfillment.dispatchedAt || null,
        done: ['dispatched', 'delivered'].includes(order.fulfillment.status),
      },
      {
        key: 'delivered',
        label: 'Delivered to Doorstep',
        date: order.fulfillment.deliveredAt || null,
        done: order.fulfillment.status === 'delivered',
      },
    ];

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.fulfillment.status,
        courier: order.fulfillment.courierPartner,
        trackingNumber: order.fulfillment.trackingNumber,
        customerName: order.customer.name,
        city: order.customer.shippingAddress.city,
        totalAmount: order.financials.totalAmount,
        itemsCount: order.items.length,
        items: order.items,
        steps,
      },
    });
  } catch (err) {
    next(err);
  }
};
