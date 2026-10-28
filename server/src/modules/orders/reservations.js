import mongoose from 'mongoose';
import { Order } from './order.model.js';
import { Product } from '../products/product.model.js';
import { Coupon } from '../coupons/coupon.model.js';

export const RESERVATION_MS = 30 * 60 * 1000;
export function expiredReservation(now = new Date()) {
  return { $or: [
    { reservationExpiresAt: { $lte: now } },
    { reservationExpiresAt: null, createdAt: { $lte: new Date(now.getTime() - RESERVATION_MS) } },
  ] };
}

// Caller must save the order in the same transaction as these inventory writes.
export async function releaseReservation(order, session) {
  if (!order.stockReserved) return;
  for (const item of order.items) {
    if (item.madeToOrder) continue;
    const result = await Product.updateOne(
      { _id: item.productId, 'variants.size': item.variantSize },
      { $inc: { 'variants.$.stock': item.quantity, totalStock: item.quantity, __v: 1 } },
      { session },
    );
    if (result.matchedCount !== 1) throw new Error('Reserved product variant is missing; inventory release needs attention');
  }
  if (order.financials.couponCode) await Coupon.updateOne(
    { code: order.financials.couponCode, timesUsed: { $gt: 0 } },
    { $inc: { timesUsed: -1 } }, { session },
  );
  order.stockReserved = false;
  order.reservationExpiresAt = undefined;
}

export async function expireReservations(now = new Date()) {
  const filter = { stockReserved: true, 'fulfillment.status': 'received',
    'payment.status': { $in: ['pending', 'failed'] }, ...expiredReservation(now) };
  const candidates = await Order.find(filter).select('_id').limit(100).lean();
  for (const candidate of candidates) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const order = await Order.findOne({ _id: candidate._id, ...filter }).session(session);
        if (!order) return;
        await releaseReservation(order, session);
        order.fulfillment.status = 'cancelled';
        order.reservationExpiredAt = now;
        await order.save({ session });
      });
    } finally { await session.endSession(); }
  }
}

export function startReservationExpiry() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try { await expireReservations(); }
    catch (error) { console.error('Reservation expiry failed:', error.message); }
    finally { running = false; }
  };
  void run();
  const timer = setInterval(run, 60_000);
  timer.unref();
  return timer;
}
