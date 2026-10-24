import { Router } from "express";
import {
  createOrder,
  getOrderByNumber,
  trackOrder,
} from "./order.controller.js";
import { downloadAcknowledgement } from "./acknowledgement.js";
const router = Router();
router.post("/", createOrder);
router.post("/track", trackOrder);
router.get("/:orderNumber/acknowledgement", downloadAcknowledgement);
router.get("/:orderNumber", getOrderByNumber);
export default router;
