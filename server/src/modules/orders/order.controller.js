import mongoose from "mongoose";
import {
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import jwt from "jsonwebtoken";
import { Order } from "./order.model.js";
import { Product } from "../products/product.model.js";
import { Coupon } from "../coupons/coupon.model.js";
import { Customer } from "../auth/customer.model.js";
import { quoteCart } from "./quote.js";
import { emailAcknowledgement } from "./email.js";
import { env } from "../../config/env.js";
import { fail, text, email } from "../../utils/validate.js";
const hash = (s) => createHash("sha256").update(s).digest("hex");
const accessToken = (key) =>
  createHmac("sha256", env.JWT_SECRET).update(`order:${key}`).digest("hex");
export const createOrder = async (req, res, next) => {
  try {
    const key = req.headers["idempotency-key"];
    if (typeof key !== "string" || !/^[\w-]{32,100}$/.test(key))
      fail("A unique idempotency key is required");
    const customer = req.body.customer || {},
      a = customer.shippingAddress || {};
    const clean = {
      name: text(customer.name, 120),
      email: text(customer.email, 254).toLowerCase(),
      phone: text(customer.phone, 30),
      shippingAddress: Object.fromEntries(
        ["addressLine1", "addressLine2", "city", "state", "pincode"].map(
          (k) => [k, text(a[k], k === "pincode" ? 20 : 200)],
        ),
      ),
    };
    clean.shippingAddress.country = "India";
    if (
      !clean.name ||
      !email(clean.email) ||
      !/^[+\d\s()-]{10,20}$/.test(clean.phone) ||
      !clean.shippingAddress.addressLine1 ||
      !clean.shippingAddress.city ||
      !clean.shippingAddress.state ||
      !/^\d{6}$/.test(clean.shippingAddress.pincode)
    )
      fail("Enter complete contact and delivery details");
    const requestHash = hash(
      JSON.stringify({
        customer: clean,
        items: req.body.items,
        couponCode: req.body.couponCode || "",
      }),
    );
    let customerId;
    if (req.headers.authorization) {
      const decoded = jwt.verify(
        req.headers.authorization.replace(/^Bearer /, ""),
        env.JWT_SECRET,
      );
      const c =
        decoded.role === "customer" &&
        (await Customer.findOne({ _id: decoded.id, isActive: true }));
      if (!c || (decoded.version||0)!==(c.tokenVersion||0) || c.email !== clean.email)
        fail("Use the email of your signed-in account", 403);
      customerId = c._id;
    }
    let order = await Order.findOne({ idempotencyKey: key });
    if (order && order.requestHash !== requestHash)
      fail("This checkout key was already used for another order", 409);
    if (!order) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const quote = await quoteCart(
            { ...req.body, pincode: clean.shippingAddress.pincode },
            session,
          );
          for (const item of quote.items) {
            if (!item.madeToOrder) {
              const result = await Product.updateOne(
                {
                  _id: item.productId,
                  isPublished: true,
                  salesPaused: { $ne: true },
                  variants: {
                    $elemMatch: {
                      size: item.variantSize,
                      stock: { $gte: item.quantity },
                    },
                  },
                },
                {
                  $inc: {
                    "variants.$.stock": -item.quantity,
                    totalStock: -item.quantity,
                    __v: 1,
                  },
                },
                { session },
              );
              if (result.modifiedCount !== 1)
                fail("Stock changed. Please review your bag", 409);
            }
          }
          if (quote.coupon) {
            const c = quote.coupon;
            const result = await Coupon.updateOne(
              {
                _id: c._id,
                isActive: true,
                expiryDate: { $gte: new Date() },
                ...(c.usageLimit == null
                  ? {}
                  : { timesUsed: { $lt: c.usageLimit } }),
              },
              { $inc: { timesUsed: 1 } },
              { session },
            );
            if (!result.modifiedCount)
              fail("Coupon is no longer available", 409);
          }
          [order] = await Order.create(
            [
              {
                orderNumber: `RV-${new Date().getFullYear()}-${randomUUID().slice(0, 12).toUpperCase()}`,
                idempotencyKey: key,
                requestHash,
                accessTokenHash: hash(accessToken(key)),
                customerId,
                customer: clean,
                items: quote.items,
                financials: quote.financials,
                payment: { gateway: "none", status: "pending" },
                fulfillment: { status: "received" },
              },
            ],
            { session },
          );
        });
      } catch (err) {
        if (err.code !== 11000) throw err;
        order = await Order.findOne({ idempotencyKey: key });
        if (!order || order.requestHash !== requestHash) throw err;
      } finally {
        await session.endSession();
      }
    }
    if (!order.acknowledgementSentAt) {
      try {
        if (await emailAcknowledgement(order, accessToken(key)))
          await Order.updateOne(
            { _id: order._id },
            { $set: { acknowledgementSentAt: new Date() } },
          );
      } catch {
        console.error(
          "Order acknowledgement email failed; order is saved and acknowledgement remains downloadable.",
        );
      }
    }
    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        financials: order.financials,
        fulfillment: order.fulfillment,
        payment: order.payment,
        accessToken: accessToken(key),
      },
      message:
        "Order request received. Payment is pending; no payment has been collected.",
    });
  } catch (err) {
    next(err);
  }
};
export async function authorizedOrder(req) {
  const number = text(
    req.params.orderNumber || req.body.orderNumber,
    80,
  ).toUpperCase();
  const order = await Order.findOne({ orderNumber: number })
    .select("+accessTokenHash")
    .lean();
  if (order?.customerId && req.headers.authorization) {
    try {
      const decoded=jwt.verify(req.headers.authorization.replace(/^Bearer /,''),env.JWT_SECRET);
      if(decoded.role==='customer' && String(order.customerId)===decoded.id && await Customer.exists({_id:decoded.id,isActive:true,tokenVersion:decoded.version||0})) return order;
    } catch { /* Fall back to private access key validation. */ }
  }
  const supplied = text(
    req.headers["x-order-token"] || req.body.accessToken,
    100,
  );
  const valid =
    order &&
    supplied &&
    order.accessTokenHash &&
    timingSafeEqual(
      Buffer.from(hash(supplied)),
      Buffer.from(order.accessTokenHash),
    );
  if (!valid) fail("Order not found or access link is invalid", 404);
  return order;
}
export const getOrderByNumber = async (req, res, next) => {
  try {
    const order = await authorizedOrder(req);
    const {
      accessTokenHash,
      requestHash,
      idempotencyKey,
      adminNotes,
      ...safe
    } = order;
    res.json({ success: true, data: safe });
  } catch (e) {
    next(e);
  }
};
export const trackOrder = async (req, res, next) => {
  try {
    const order = await authorizedOrder(req);
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        fulfillment: order.fulfillment,
        payment: order.payment,
        createdAt: order.createdAt,
        items: order.items,
        financials: order.financials,
      },
    });
  } catch (e) {
    next(e);
  }
};
