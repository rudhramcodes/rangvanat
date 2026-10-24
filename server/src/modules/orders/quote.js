import { Product } from "../products/product.model.js";
import { Coupon } from "../coupons/coupon.model.js";
import { getSettings } from "../settings/settings.model.js";
import { fail, integer, text } from "../../utils/validate.js";
export const cents = (n) => Math.round(n * 100);
export function delivery(settings, pincode) {
  if (!/^\d{6}$/.test(pincode) || pincode[0] === "0")
    fail("Enter a valid six-digit Indian PIN code");
  const serviceable = settings.serviceablePrefixes.some((p) =>
    pincode.startsWith(p),
  );
  return {
    serviceable,
    days: settings.deliveryDays,
    message: serviceable
      ? `Estimated ${settings.deliveryDays} delivery days after making`
      : "Delivery is not configured for this PIN code. Contact the studio.",
  };
}
export function discountFor(coupon, subtotal) {
  if (
    !coupon ||
    !coupon.isActive ||
    new Date(coupon.expiryDate) < new Date() ||
    (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) ||
    subtotal < cents(coupon.minCartValue)
  )
    fail("Coupon is invalid, expired, exhausted or below its minimum spend");
  const amount =
    coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : cents(coupon.discountValue);
  return Math.min(
    subtotal,
    amount,
    coupon.maxDiscountCap == null ? subtotal : cents(coupon.maxDiscountCap),
  );
}
export async function quoteCart(body, session = null) {
  if (
    !Array.isArray(body.items) ||
    !body.items.length ||
    body.items.length > 50
  )
    fail("Choose between 1 and 50 cart lines");
  const settings = await getSettings();
  if (body.pincode && !delivery(settings, text(body.pincode, 20)).serviceable)
    fail("Delivery unavailable for this PIN code");
  const merged = new Map();
  for (const item of body.items) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      fail("Invalid cart item");
    if (
      !integer(item.quantity, 1, 99) ||
      !/^[a-f\d]{24}$/i.test(item.productId || "") ||
      !text(item.variantSize, 40)
    )
      fail("Invalid product, variant or quantity");
    const measurements = Object.fromEntries(
      ["bust", "waist", "hip", "height", "notes"].map((k) => [
        k,
        text(item.customMeasurements?.[k], k === "notes" ? 500 : 30),
      ]),
    );
    for (const key of ["bust", "waist", "hip", "height"])
      if (
        measurements[key] &&
        (!Number.isFinite(Number(measurements[key])) ||
          Number(measurements[key]) <= 0 ||
          Number(measurements[key]) > 120)
      )
        fail("Measurements must be between 0 and 120 inches");
    if (
      item.variantSize === "Custom" &&
      !measurements.notes &&
      !measurements.bust &&
      !measurements.waist
    )
      fail("Add measurements or fitting notes for a custom size");
    const key = `${item.productId}:${item.variantSize}:${JSON.stringify(measurements)}`;
    const prior = merged.get(key);
    merged.set(key, {
      ...item,
      customMeasurements: measurements,
      quantity: (prior?.quantity || 0) + item.quantity,
    });
  }
  const items = [],
    demands = new Map();
  for (const item of merged.values()) {
    const product = await Product.findOne({
      _id: item.productId,
      isPublished: true,
    })
      .session(session)
      .lean();
    if (!product || product.salesPaused)
      fail("A product is no longer available", 409);
    const variant = product.variants.find((v) => v.size === item.variantSize);
    if (!variant) fail(`Choose a valid size for ${product.title}`);
    const key = `${product._id}:${variant.size}`;
    const requested = (demands.get(key) || 0) + item.quantity;
    demands.set(key, requested);
    if (requested > 99 || (!product.madeToOrder && requested > variant.stock))
      fail(`Insufficient stock for ${product.title} (${variant.size})`, 409);
    const unitPrice = cents(product.price) + cents(variant.priceDelta);
    if (unitPrice < 0 || !Number.isSafeInteger(unitPrice * item.quantity))
      fail("Invalid product price", 409);
    items.push({
      productId: product._id,
      productTitle: product.title,
      image: product.images[0]?.url || "",
      variantSize: variant.size,
      customMeasurements: item.customMeasurements,
      quantity: item.quantity,
      unitPrice: unitPrice / 100,
      subtotal: (unitPrice * item.quantity) / 100,
      madeToOrder: product.madeToOrder,
      leadTimeDays: product.leadTimeDays,
    });
  }
  const subtotal = items.reduce((sum, i) => sum + cents(i.subtotal), 0);
  if (!Number.isSafeInteger(subtotal)) fail("Cart total is too large");
  const couponCode = text(body.couponCode, 40).toUpperCase();
  const coupon = couponCode
    ? await Coupon.findOne({ code: couponCode }).session(session).lean()
    : null;
  const discountAmount = couponCode ? discountFor(coupon, subtotal) : 0;
  const shippingFee =
    subtotal >= cents(settings.freeShippingThreshold)
      ? 0
      : cents(settings.shippingFee);
  return {
    items,
    coupon,
    deliveryDays:
      settings.deliveryDays +
      Math.max(...items.map((i) => i.leadTimeDays || 0)),
    financials: {
      subtotal: subtotal / 100,
      discountAmount: discountAmount / 100,
      couponCode: couponCode || null,
      shippingFee: shippingFee / 100,
      taxAmount: 0,
      totalAmount: (subtotal - discountAmount + shippingFee) / 100,
    },
  };
}
