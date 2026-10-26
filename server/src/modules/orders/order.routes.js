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

const router = Router();

router.post("/webhook/razorpay", handleRazorpayWebhook);
router.post("/", createOrder);
router.post("/track", trackOrder);
router.get("/:orderNumber/acknowledgement", downloadAcknowledgement);
router.get("/:orderNumber", getOrderByNumber);

// Payment Rails (§12)
router.post("/:orderNumber/pay/razorpay", createRazorpayOrder);
router.post("/:orderNumber/pay/razorpay/verify", verifyRazorpayPayment);
router.post("/:orderNumber/pay/cod", confirmCodOrder);

export default router;
