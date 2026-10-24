import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/database/db.js";
import { AdminUser } from "../src/modules/auth/admin.model.js";
const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME = "Rangvanaat Admin",
} = process.env;
if (
  !ADMIN_EMAIL ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) ||
  !ADMIN_PASSWORD ||
  ADMIN_PASSWORD.length < 12 ||
  ADMIN_PASSWORD.length > 72
)
  throw new Error(
    "Set ADMIN_EMAIL and a unique ADMIN_PASSWORD (12–72 characters) in your environment",
  );
await connectDB();
try {
  if (await AdminUser.exists({ email: ADMIN_EMAIL.toLowerCase() }))
    throw new Error(
      "Admin already exists; this command never resets existing passwords",
    );
  await AdminUser.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "superadmin",
  });
  console.log("Administrator created. Sign in at /admin.");
} finally {
  await mongoose.disconnect();
}
