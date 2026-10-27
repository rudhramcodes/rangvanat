import path from "node:path";
import { existsSync } from "node:fs";
import {fileURLToPath} from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import productRoutes from "./modules/products/product.routes.js";
import collectionRoutes from "./modules/collections/collection.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import storefrontRoutes from "./modules/storefront/storefront.routes.js";
import { getSettings } from "./modules/settings/settings.model.js";
import { quoteCart, delivery } from "./modules/orders/quote.js";
import { asyncRoute, ok, text } from "./utils/validate.js";
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL.split(",").map((s) => s.trim()),
    credentials: false,
  }),
);
app.use(
  express.json({
    limit: "256kb",
    // Keep the raw payload so Razorpay webhook signatures verify byte-for-byte.
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    // Server-rendered public reads share the Next.js server IP; do not exhaust shopper write quotas.
    skip: (req) => req.method === "GET",
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(
  ["/api/auth/login", "/api/auth/register", "/api/admin/login", "/api/auth/password", "/api/auth/email"],
  authLimit,
);
app.get("/api/health", (req, res) => ok(res, { status: "healthy" }));
app.get(
  "/api/settings",
  asyncRoute(async (req, res) => {
    const s = await getSettings();
    s.pages = s.pages.filter((p) => p.published);
    delete s._id;
    delete s.__v;
    ok(res, s);
  }),
);
app.get(
  "/api/delivery/:pincode",
  asyncRoute(async (req, res) =>
    ok(res, delivery(await getSettings(), text(req.params.pincode, 20))),
  ),
);
app.use(
  "/api/orders",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.post(
  "/api/cart/quote",
  asyncRoute(async (req, res) => {
    const { coupon, ...quote } = await quoteCart(req.body);
    ok(res, quote);
  }),
);
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/storefront", storefrontRoutes);
app.use("/api", (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
if (env.NODE_ENV === "production") {
  const dist = fileURLToPath(new URL("../../dist/", import.meta.url));
  // The API can run on its own host (api.rangvanat.com) without a storefront
  // build, so only serve the SPA when a build is actually present.
  if (existsSync(path.join(dist, "index.html"))) {
    app.use(express.static(dist));
    app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
  }
}
app.use(errorHandler);
export default app;
