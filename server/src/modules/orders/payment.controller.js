import { Order } from "./order.model.js";
import { authorizedOrder } from "./order.controller.js";
import { fail } from "../../utils/validate.js";

// Online payments remain disabled until the Razorpay integration task is complete.
export function createRazorpayOrder(_req, res) {
  return res.status(503).json({ success: false, message: "Online payments are not available yet. Please choose Cash on Delivery." });
}
export const verifyRazorpayPayment = createRazorpayOrder;
export const handleRazorpayWebhook = createRazorpayOrder;

export async function confirmCodOrder(req, res, next) {
  try {
    const owned = await authorizedOrder(req);
    const order = await Order.findOneAndUpdate(
      {
        _id: owned._id,
        "payment.gateway": { $in: ["none", "cod"] },
        "payment.status": "pending",
        "payment.gatewayOrderId": { $in: ["", null] },
        "payment.transactionId": { $in: ["", null] },
        stockReserved: true,
        "fulfillment.status": "received",
      },
      { $set: { "payment.gateway": "cod", "fulfillment.status": "in_stitching" } },
      { new: true },
    );
    const confirmed = order || await Order.findById(owned._id);
    // Retries succeed without changing a confirmed order or rewinding fulfillment.
    if (!confirmed || confirmed.payment.gateway !== "cod" ||
        confirmed.payment.status !== "pending" ||
        confirmed.payment.gatewayOrderId || confirmed.payment.transactionId ||
        !confirmed.stockReserved ||
        !["in_stitching", "dispatched", "delivered"].includes(confirmed.fulfillment.status))
      fail("This order cannot be confirmed for Cash on Delivery", 409);
    return res.json({
      success: true,
      message: "Order confirmed via Cash on Delivery.",
      data: {
        orderNumber: confirmed.orderNumber,
        paymentStatus: confirmed.payment.status,
        fulfillmentStatus: confirmed.fulfillment.status,
        gateway: "cod",
      },
    });
  } catch (err) {
    next(err);
  }
}
