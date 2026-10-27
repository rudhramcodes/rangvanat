import crypto from "node:crypto";
import { Order } from "./order.model.js";
import { env } from "../../config/env.js";

/**
 * Creates a Razorpay Order ID for online payment.
 * Works seamlessly with live/test Razorpay API or sandbox mock when credentials are test mode.
 */
export async function createRazorpayOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.payment.status === "paid") {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    const amountInPaise = Math.round(order.financials.totalAmount * 100);

    const hasGatewayCredentials =
      Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) &&
      !env.RAZORPAY_KEY_ID.startsWith("rzp_test_placeholder");

    // Never fall back to the sandbox mock in production: it would mark orders
    // paid without collecting any money.
    if (!hasGatewayCredentials && env.NODE_ENV === "production") {
      return res.status(503).json({
        success: false,
        message:
          "Online payment is temporarily unavailable. Please choose Cash on Delivery.",
      });
    }

    // If live/test Razorpay credentials are configured
    if (hasGatewayCredentials) {
      const auth = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
      ).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            orderNumber: order.orderNumber,
            customerEmail: order.customer.email,
          },
        }),
      });

      const rzData = await response.json();
      if (!response.ok) {
        throw new Error(rzData.error?.description || "Failed to create Razorpay order");
      }

      order.payment.gatewayOrderId = rzData.id;
      order.payment.gateway = "razorpay";
      await order.save();

      return res.json({
        success: true,
        data: {
          keyId: env.RAZORPAY_KEY_ID,
          razorpayOrderId: rzData.id,
          amount: amountInPaise,
          currency: "INR",
          orderNumber: order.orderNumber,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
          },
        },
      });
    }

    // Sandbox Mock for dev / test mode without active keys
    const mockRazorpayOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    order.payment.gatewayOrderId = mockRazorpayOrderId;
    order.payment.gateway = "razorpay";
    await order.save();

    return res.json({
      success: true,
      sandbox: true,
      data: {
        keyId: env.RAZORPAY_KEY_ID || "rzp_test_mock_atelier",
        razorpayOrderId: mockRazorpayOrderId,
        amount: amountInPaise,
        currency: "INR",
        orderNumber: order.orderNumber,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cryptographically verifies Razorpay payment signature
 */
export async function verifyRazorpayPayment(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isSandbox =
      !env.RAZORPAY_KEY_SECRET ||
      razorpay_order_id?.startsWith("order_mock_") ||
      env.RAZORPAY_KEY_SECRET.startsWith("replace-");

    if (isSandbox && env.NODE_ENV === "production") {
      return res.status(400).json({
        success: false,
        message: "Payment verification is unavailable for this order.",
      });
    }

    if (!isSandbox) {
      // A valid signature only proves the payment belongs to the Razorpay order
      // it names, so make sure that is the order created for this order number.
      if (
        order.payment.gatewayOrderId &&
        order.payment.gatewayOrderId !== razorpay_order_id
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment does not match this order.",
        });
      }

      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        order.payment.status = "failed";
        await order.save();
        return res.status(400).json({
          success: false,
          message: "Cryptographic signature mismatch. Payment verification failed.",
        });
      }
    }

    // Mark paid & begin studio stitching
    order.payment.gateway = "razorpay";
    order.payment.status = "paid";
    order.payment.transactionId = razorpay_payment_id || `pay_mock_${Date.now()}`;
    order.payment.paidAt = new Date();
    if (order.fulfillment.status === "received") {
      order.fulfillment.status = "in_stitching";
    }
    await order.save();

    return res.json({
      success: true,
      message: "Payment successfully verified and order is now in crafting.",
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        fulfillmentStatus: order.fulfillment.status,
        transactionId: order.payment.transactionId,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cash on Delivery confirmation
 */
export async function confirmCodOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.payment.gateway = "cod";
    order.payment.status = "pending";
    if (order.fulfillment.status === "received") {
      order.fulfillment.status = "in_stitching";
    }
    await order.save();

    return res.json({
      success: true,
      message: "Order confirmed via Cash on Delivery.",
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        fulfillmentStatus: order.fulfillment.status,
        gateway: "cod",
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Razorpay Webhook Handler
 */
export async function handleRazorpayWebhook(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      if (env.NODE_ENV === "production") {
        return res
          .status(503)
          .json({ status: "webhook secret not configured" });
      }
    } else if (!signature) {
      return res.status(400).json({ status: "missing signature" });
    } else {
      // Verify the raw payload: a re-serialised body can differ from the bytes
      // Razorpay signed.
      const payload = req.rawBody || Buffer.from(JSON.stringify(req.body));
      const digest = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      if (digest !== signature) {
        return res.status(400).json({ status: "invalid signature" });
      }
    }

    const event = req.body.event;
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderNumber = paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        const order = await Order.findOne({ orderNumber });
        if (order && order.payment.status !== "paid") {
          order.payment.status = "paid";
          order.payment.transactionId = paymentEntity.id;
          order.payment.paidAt = new Date();
          order.fulfillment.status = "in_stitching";
          await order.save();
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return res.status(500).json({ status: "error" });
  }
}
