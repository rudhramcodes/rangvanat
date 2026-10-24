import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminUser } from "../modules/auth/admin.model.js";
import { Customer } from "../modules/auth/customer.model.js";
import { asyncRoute, fail } from "../utils/validate.js";
export const requireAdmin = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) fail("Please sign in as an administrator", 401);
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (!["manager", "superadmin"].includes(decoded.role))
    fail("Administrator access required", 403);
  const admin = await AdminUser.findOne({ _id: decoded.id, isActive: true });
  if (!admin || admin.role !== decoded.role)
    fail("Administrator access revoked", 401);
  req.admin = admin;
  next();
});
export const requireCustomer = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) fail("Please sign in", 401);
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (decoded.role !== "customer") fail("Customer access required", 403);
  req.customer = await Customer.findOne({
    _id: decoded.id,
    isActive: true,
  }).select("-passwordHash");
  if (!req.customer || (decoded.version||0)!==(req.customer.tokenVersion||0)) fail("Account unavailable. Please sign in again.", 401);
  next();
});
