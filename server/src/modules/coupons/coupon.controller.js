import { Coupon } from './coupon.model.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).lean();

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.minCartValue.toLocaleString('en-IN')}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountCap) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        message: `Coupon applied: ₹${discountAmount.toLocaleString('en-IN')} off!`,
      },
    });
  } catch (err) {
    next(err);
  }
};
