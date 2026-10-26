import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/database/db.js";
import { AdminUser } from "../src/modules/auth/admin.model.js";

const email = "webworksbyfaiz@gmail.com";
const password = "Admin@123";
const name = "Faiz (Admin)";

try {
  await connectDB();
  const deleteResult = await AdminUser.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} existing admin(s).`);

  const passwordHash = await bcrypt.hash(password, 12);
  const newAdmin = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "superadmin",
    isActive: true,
  });

  console.log(`Successfully created new admin: ${newAdmin.email}`);
} catch (error) {
  console.error("Error resetting admin:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
