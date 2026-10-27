import { Router } from "express";
import {
  createOrder,
  getOrderByNumber,
  trackOrder,
} from "./order.controller.js";
import { downloadAcknowledgement } from "./acknowledgement.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  confirmCodOrder,
  handleRazorpayWebhook,
} from "./payment.controller.js";

import { preventDemoOrders } from "./demo-guard.js";

const router = Router();

router.post("/webhook/razorpay", handleRazorpayWebhook);
router.post("/", preventDemoOrders, createOrder);
router.post("/track", trackOrder);
router.get("/:orderNumber/acknowledgement", downloadAcknowledgement);
router.get("/:orderNumber", getOrderByNumber);

// Payment Rails (§12)
router.post("/:orderNumber/pay/razorpay", preventDemoOrders, createRazorpayOrder);
router.post("/:orderNumber/pay/razorpay/verify", preventDemoOrders, verifyRazorpayPayment);
router.post("/:orderNumber/pay/cod", preventDemoOrders, confirmCodOrder);

export default router;
