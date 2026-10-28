import mongoose from "mongoose";
import { text, email as validEmail } from "../../utils/validate.js";

// Simple in-DB schemas for newsletter and inquiries
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    topic: { type: String, default: "General Enquiry" },
    message: { type: String, required: true },
    productRef: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);
export const Enquiry =
  mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const email = text(req.body.email, 254).toLowerCase();
    if (!validEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid email address is required" });
    }

    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim(), subscribedAt: new Date() },
      { upsert: true, new: true },
    );

    res.json({
      success: true,
      message: "Namaste! You have been welcomed into Letters from the Loom.",
    });
  } catch (err) {
    next(err);
  }
};

import { sendEnquiryEmails } from "./enquiry.email.js";

export const submitEnquiry = async (req, res, next) => {
  try {
    const name = text(req.body.name, 120),
      email = text(req.body.email, 254).toLowerCase(),
      phone = text(req.body.phone, 30),
      topic = text(req.body.topic, 100),
      message = text(req.body.message),
      productRef = text(req.body.productRef, 100);

    if (!name || !validEmail(email) || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and message are required",
        });
    }

    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      topic: topic || "General Enquiry",
      message: message.trim(),
      productRef: productRef || "",
    });

    await enquiry.save();

    let emailed = false;
    try {
      emailed = await sendEnquiryEmails(enquiry);
    } catch (emailErr) {
      console.error("Enquiry email error:", emailErr?.message || emailErr);
    }

    res.json({
      success: true,
      message:
        "Thank you for reaching out to Rangvanat. Our master weaver or stylist will contact you within 24 hours.",
        emailed,
    });
  } catch (err) {
    next(err);
  }
};

export const getStoreStats = async (req, res) => {
  res.json({
    success: true,
    data: {
      artisansCount: "200+",
      generations: "3",
      craftType: "100% Handloom",
      cluster: "1 Village Cluster (Bardoli)",
      shippingThreshold: 15000,
    },
  });
};
