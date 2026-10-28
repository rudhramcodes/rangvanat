import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-"))
) {
  throw new Error(
    "Set JWT_SECRET to at least 32 random characters in production",
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5001),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rangvanat",
  JWT_SECRET: process.env.JWT_SECRET || randomBytes(48).toString("hex"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",

  // Emails
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  STORE_EMAIL: process.env.STORE_EMAIL || "orders@rangvanat.com",
};
