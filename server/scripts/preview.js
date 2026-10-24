process.env.RESEND_API_KEY = "";
// Isolated review server: temporary MongoDB, approved-looking test records only in the temporary DB.
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
const repl = await MongoMemoryReplSet.create({
  replSet: { count: 1 },
  binary: { version: "7.0.14" },
});
process.env.MONGO_URI = repl.getUri();
process.env.JWT_SECRET = randomBytes(48).toString("hex");
const { default: app } = await import("../src/app.js");
const { Product } = await import("../src/modules/products/product.model.js");
const { Collection } =
  await import("../src/modules/collections/collection.model.js");
const { Settings } = await import("../src/modules/settings/settings.model.js");
const { AdminUser } = await import("../src/modules/auth/admin.model.js");
const { Coupon } = await import("../src/modules/coupons/coupon.model.js");
const { PRODUCTS, COLLECTIONS } = await import("../../src/lib/lookbook.js");
await mongoose.connect(repl.getUri());
await Promise.all([
  Product.init(),
  Collection.init(),
  Settings.init(),
  AdminUser.init(),
  Coupon.init(),
]);
for (const [i, c] of COLLECTIONS.entries())
  await Collection.create({
    collectionId: c.id,
    name: c.name,
    mood: c.mood || c.name,
    coverImage:
      c.image || PRODUCTS.find((p) => p.collection === c.id)?.image || "",
    displayOrder: i,
  });
for (const p of PRODUCTS.slice(0, 12))
  await Product.create({
    title: `${p.name}`,
    slug: `review-${p.id}`,
    collectionId: p.collection,
    category: p.category,
    price: 15000,
    description: p.description || p.name,
    heritageCraftStory: p.specs?.join("\n") || "",
    fabric: "Khadi",
    craft: "Hand embroidery",
    washCare: "Dry clean only.",
    sizeGuide:
      "Measurements in inches. Contact the studio for fitting assistance.",
    images: [{ url: p.image, alt: p.name }],
    variants: [
      { size: "M", sku: `REVIEW-${p.id}-M`, stock: 4, priceDelta: 0 },
      {
        size: "Custom",
        sku: `REVIEW-${p.id}-CUSTOM`,
        stock: 3,
        priceDelta: 1500,
      },
    ],
    isPublished: true,
    isFeatured: true,
    leadTimeDays: 7,
  });
await Settings.create({
  key: "store",
  logo: "/images/logo-only.svg",
  favicon: "/images/logo-only.svg",
  announcement: "LOCAL REVIEW · Sample prices and stock · No payments",
  serviceablePrefixes: ["395"],
  sections: [
    {
      title: "Khadi, with a point of view.",
      body: "A closer look at the textures, embroidery and considered details that bring each Rangvanaat piece to life.",
      image: "/images/khadi-editorial-diptych.png",
      href: "/products",
      enabled: true,
    },
  ],
});
const password =
  process.env.PREVIEW_ADMIN_PASSWORD || randomBytes(18).toString("base64url");
await AdminUser.create({
  name: "Review Admin",
  email: "review@example.com",
  passwordHash: await bcrypt.hash(password, 10),
  role: "superadmin",
});
await Coupon.create({
  code: "REVIEW10",
  discountType: "percentage",
  discountValue: 10,
  minCartValue: 0,
  expiryDate: new Date(Date.now() + 86400000),
  usageLimit: 10,
});
const port = Number(process.env.PREVIEW_PORT || 5001);
const server = app.listen(port, "127.0.0.1", () => {
  console.log(
    `Isolated review API on http://127.0.0.1:${port}. All records disappear on shutdown.`,
  );
  if (!process.env.PREVIEW_ADMIN_PASSWORD)
    console.log(`Temporary admin: review@example.com / ${password}`);
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await new Promise((r) => server.close(r));
  await mongoose.disconnect();
  await repl.stop().catch(() => {});
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
