import { releaseReservation, expiredReservation } from '../orders/reservations.js';
import { paginatedList } from "../../utils/pagination.js";
import { Router } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { AdminUser } from "../auth/admin.model.js";
import { Product } from "../products/product.model.js";
import { Collection } from "../collections/collection.model.js";
import { Coupon } from "../coupons/coupon.model.js";
import { Order } from "../orders/order.model.js";
import { Settings, getSettings } from "../settings/settings.model.js";
import { Subscriber, Enquiry } from "../storefront/storefront.controller.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { env } from "../../config/env.js";
import {
  asyncRoute,
  fail,
  text,
  integer,
  imageUrl,
  ok,
} from "../../utils/validate.js";
const router = Router();
router.post(
  "/login",
  asyncRoute(async (req, res) => {
    const admin = await AdminUser.findOne({
      email: text(req.body.email, 254).toLowerCase(),
      isActive: true,
    });
    if (
      !admin ||
      typeof req.body.password !== "string" ||
      !(await admin.comparePassword(req.body.password))
    )
      fail("Invalid email or password", 401);
    admin.lastLogin = new Date();
    await admin.save();
    ok(res, {
      token: jwt.sign({ id: admin._id, role: admin.role }, env.JWT_SECRET, {
        expiresIn: "4h",
      }),
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  }),
);
router.use(requireAdmin);
router.get("/me", (req, res) =>
  ok(res, {
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
  }),
);
router.get(
  "/dashboard",
  asyncRoute(async (req, res) => {
    const settings = await getSettings();
    const [products, orders, lowStock, recentOrders, enquiries] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Product.find({
          madeToOrder: false,
          $or: [
            { totalStock: { $lte: settings.lowStockThreshold } },
            { "variants.stock": { $lte: settings.lowStockThreshold } },
          ],
        })
          .select("title totalStock variants")
          .sort({ totalStock: 1 })
          .limit(50)
          .lean(),
        Order.find()
          .select(
            "orderNumber customer.name financials payment fulfillment createdAt",
          )
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Enquiry.countDocuments(),
      ]);
    ok(res, { products, orders, lowStock, recentOrders, enquiries });
  }),
);
router.get(
  "/settings",
  asyncRoute(async (req, res) => ok(res, await getSettings())),
);
router.put(
  "/settings",
  asyncRoute(async (req, res) => {
    const b = req.body,
      updates = {};
    if ("demoMode" in b) {
      if (typeof b.demoMode !== "boolean") fail("Demo mode must be true or false");
      updates.demoMode = b.demoMode;
    }
    for (const k of [
      "name",
      "description",
      "announcement",
      "heroTitle",
      "heroText",
      "contactEmail",
      "phone",
      "address",
    ])
      if (k in b) updates[k] = text(b[k], 2000);
    for (const k of ["logo", "favicon", "heroImage", "heroVideo"])
      if (k in b) updates[k] = imageUrl(b[k]);
    if ("instagram" in b) {
      if (
        b.instagram &&
        !/^https:\/\/(www\.)?instagram\.com\//.test(b.instagram)
      )
        fail("Enter an Instagram HTTPS profile URL");
      updates.instagram = b.instagram || "";
    }
    for (const k of [
      "shippingFee",
      "freeShippingThreshold",
      "deliveryDays",
      "lowStockThreshold",
    ])
      if (k in b) {
        if (!integer(b[k], k === "deliveryDays" ? 1 : 0, 1000000))
          fail(`Invalid ${k}`);
        updates[k] = b[k];
      }
    if ("serviceablePrefixes" in b) {
      if (
        !Array.isArray(b.serviceablePrefixes) ||
        b.serviceablePrefixes.length > 1000 ||
        b.serviceablePrefixes.some(
          (v) => typeof v !== "string" || !/^[1-9]\d{0,5}$/.test(v),
        )
      )
        fail("Enter Indian PIN prefixes of 1–6 digits");
      updates.serviceablePrefixes = [...new Set(b.serviceablePrefixes)];
    }
    if ("navigation" in b) {
      if (!Array.isArray(b.navigation) || b.navigation.length > 8)
        fail("Add up to eight navigation links");
      updates.navigation = b.navigation.map((link) => {
        if (
          !text(link.label, 40) ||
          typeof link.href !== "string" ||
          !link.href.startsWith("/") ||
          link.href.startsWith("//") ||
          /[\\\s]/.test(link.href)
        )
          fail("Navigation needs a label and a local path");
        return { label: text(link.label, 40), href: text(link.href, 200) };
      });
    }
    if ("pages" in b) {
      if (!Array.isArray(b.pages) || b.pages.length > 100)
        fail("Invalid pages");
      updates.pages = b.pages.map((p) => {
        const slug = text(p.slug, 80);
        if (!/^[a-z0-9-]+$/.test(slug))
          fail("Page slugs need lowercase letters, numbers and hyphens");
        return {
          slug,
          title: text(p.title, 200),
          body: text(p.body, 30000),
          published: p.published !== false,
        };
      });
      if (
        new Set(updates.pages.map((p) => p.slug)).size !== updates.pages.length
      )
        fail("Page slugs must be unique");
    }
    if ("sections" in b) {
      if (!Array.isArray(b.sections) || b.sections.length > 20)
        fail("Invalid homepage sections");
      updates.sections = b.sections.map((s) => {
        if (
          s.href &&
          (!s.href.startsWith("/") ||
            s.href.startsWith("//") ||
            /[\\\s]/.test(s.href))
        )
          fail("Section links must be local paths");
        return {
          title: text(s.title, 200),
          body: text(s.body, 2000),
          image: imageUrl(s.image),
          href: text(s.href, 200),
          enabled: s.enabled !== false,
        };
      });
    }
    ok(
      res,
      await Settings.findOneAndUpdate(
        { key: "store" },
        { $set: updates },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      ),
    );
  }),
);
router.patch(
  "/products/:id/availability",
  asyncRoute(async (req, res) => {
    if (typeof req.body.salesPaused !== "boolean")
      fail("Specify whether sales are paused");
    const product = await Product.findById(req.params.id);
    if (!product) fail("Product not found", 404);
    product.salesPaused = req.body.salesPaused;
    await product.save();
    ok(res, product);
  }),
);
const models = { products: Product, collections: Collection, coupons: Coupon };
function fields(kind, b) {
  if (kind === "products") {
    if (
      !text(b.title, 200) ||
      !/^[a-z0-9-]+$/.test(b.slug || "") ||
      !text(b.collectionId, 80) ||
      !text(b.category, 100) ||
      !text(b.description)
    )
      fail(
        "Title, URL slug, collection, category and description are required",
      );
    if (
      typeof b.price !== "number" ||
      !Number.isFinite(b.price) ||
      b.price < 0 ||
      b.price > 10000000
    )
      fail("Enter a valid price");
    if (
      !Array.isArray(b.variants) ||
      !b.variants.length ||
      b.variants.length > 30
    )
      fail("Add 1–30 size variants");
    const variants = b.variants.map((v) => {
      if (
        !text(v.size, 40) ||
        !text(v.sku, 100) ||
        !integer(v.stock) ||
        typeof v.priceDelta !== "number" ||
        !Number.isFinite(v.priceDelta) ||
        Math.abs(v.priceDelta) > 10000000 ||
        b.price + v.priceDelta < 0
      )
        fail(
          "Each variant needs size, SKU, integer stock and valid price adjustment",
        );
      return {
        size: text(v.size, 40),
        sku: text(v.sku, 100),
        stock: v.stock,
        priceDelta: Math.round(v.priceDelta * 100) / 100,
      };
    });
    if (
      new Set(variants.map((v) => v.size)).size !== variants.length ||
      new Set(variants.map((v) => v.sku)).size !== variants.length
    )
      fail("Sizes and SKUs must be unique within the product");
    if (
      !Array.isArray(b.images) ||
      b.images.length > 20 ||
      (b.isPublished && !b.images.length)
    )
      fail("Published products need a photo (maximum 20)");
    if (!integer(b.leadTimeDays, 0, 365))
      fail("Making time must be between 0 and 365 days");
    if (
      b.compareAtPrice != null &&
      (typeof b.compareAtPrice !== "number" ||
        !Number.isFinite(b.compareAtPrice) ||
        b.compareAtPrice < b.price)
    )
      fail("Compare-at price must be at least the selling price");
    return {
      ...Object.fromEntries(
        [
          "title",
          "slug",
          "collectionId",
          "category",
          "description",
          "heritageCraftStory",
          "washCare",
          "fabric",
          "craft",
          "sizeGuide",
          "seoTitle",
          "seoDescription",
        ].map((k) => [k, text(b[k])]),
      ),
      price: Math.round(b.price * 100) / 100,
      compareAtPrice: b.compareAtPrice ?? null,
      variants,
      images: b.images.map((i) => ({
        url: imageUrl(i.url),
        alt: text(i.alt, 200),
        publicId: text(i.publicId, 200),
      })),
      salesPaused: b.salesPaused === true,
      madeToOrder: b.madeToOrder === true,
      isPublished: b.isPublished === true,
      isFeatured: b.isFeatured === true,
      leadTimeDays: b.leadTimeDays,
    };
  }
  if (kind === "collections") {
    if (
      !/^[a-z0-9-]+$/.test(b.collectionId || "") ||
      !text(b.name, 200) ||
      !text(b.mood, 200) ||
      !integer(b.displayOrder, 0, 10000)
    )
      fail("Enter collection ID, name, description and display order");
    return {
      collectionId: b.collectionId,
      name: text(b.name, 200),
      mood: text(b.mood, 200),
      coverImage: imageUrl(b.coverImage),
      displayOrder: b.displayOrder,
      isActive: b.isActive === true,
    };
  }
  if (
    !/^[A-Z0-9_-]{2,40}$/.test(b.code || "") ||
    !["fixed", "percentage"].includes(b.discountType) ||
    !Number.isFinite(b.discountValue) ||
    b.discountValue < 1 ||
    (b.discountType === "percentage" && b.discountValue > 100) ||
    !Number.isFinite(new Date(b.expiryDate).getTime())
  )
    fail("Enter a valid code, discount and expiry date");
  if (
    !integer(b.minCartValue) ||
    (b.usageLimit != null && !integer(b.usageLimit, 1)) ||
    (b.maxDiscountCap != null && !integer(b.maxDiscountCap, 1))
  )
    fail("Invalid coupon minimum, usage limit or discount cap");
  return {
    code: b.code,
    discountType: b.discountType,
    discountValue: b.discountValue,
    minCartValue: b.minCartValue,
    maxDiscountCap: b.maxDiscountCap ?? null,
    usageLimit: b.usageLimit ?? null,
    expiryDate: new Date(b.expiryDate),
    isActive: b.isActive === true,
  };
}
router.get("/orders", asyncRoute(async (req, res) => {
  if (req.query.paginated === 'true') return ok(res, await paginatedList(Order, req.query, ['orderNumber', 'customer.name', 'customer.email', 'fulfillment.status', 'payment.status'], '-requestHash -idempotencyKey'));
  ok(res, await Order.find().select('-requestHash -idempotencyKey').sort({createdAt:-1}).limit(200).lean());
}));
router.put(
  "/orders/:id",
  asyncRoute(async (req, res) => {
    if (
      ![
        "received",
        "in_stitching",
        "dispatched",
        "delivered",
        "cancelled",
      ].includes(req.body.status)
    )
      fail("Invalid fulfillment status");
    const updateOrder = async (session) => {
      const opts = { session };
      const order = await Order.findById(req.params.id, null, opts);
      if (!order) fail("Order not found", 404);
      const before = order.fulfillment.status,
        after = req.body.status;
      const transitions = {
        received: ["received", "in_stitching", "cancelled"],
        in_stitching: ["in_stitching", "dispatched", "cancelled"],
        dispatched: ["dispatched", "delivered"],
        delivered: ["delivered"],
        cancelled: ["cancelled"],
      };
      if (!transitions[before]?.includes(after))
        fail(`Cannot move ${before} to ${after}`, 409);
      if (
        after === "dispatched" &&
        (!text(req.body.courierPartner) || !text(req.body.trackingNumber))
      )
        fail("Add courier and tracking number before dispatch");
      if (after === "cancelled" && order.stockReserved) {
        await releaseReservation(order, session);
      }
      if (before === 'received' && after === 'in_stitching') {
        if (await Order.exists({ _id: order._id, ...expiredReservation() }).session(session))
          fail('Checkout reservation expired. Please create a new order.', 409);
        order.reservationExpiresAt = undefined;
      }
      order.fulfillment.status = after;
      order.fulfillment.courierPartner = text(req.body.courierPartner, 100);
      order.fulfillment.trackingNumber = text(req.body.trackingNumber, 100);
      if (after === "dispatched" && !order.fulfillment.dispatchedAt)
        order.fulfillment.dispatchedAt = new Date();
      if (after === "delivered" && !order.fulfillment.deliveredAt)
        order.fulfillment.deliveredAt = new Date();
      order.adminNotes = text(req.body.adminNotes, 3000);
      await order.save(opts);
      return order;
    };

    let order;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order = await updateOrder(session);
      });
    } finally {
      await session.endSession();
    }
    ok(res, order);
  }),
);
router.get('/enquiries', asyncRoute(async (req,res) => {
  if(req.query.paginated === 'true') return ok(res, await paginatedList(Enquiry,req.query,['name','email','message','topic']));
  ok(res,await Enquiry.find().sort({createdAt:-1}).limit(200).lean());
}));
router.get('/subscribers', asyncRoute(async (req,res) => {
  if(req.query.paginated === 'true') return ok(res, await paginatedList(Subscriber,req.query,['email']));
  ok(res,await Subscriber.find().sort({createdAt:-1}).limit(1000).lean());
}));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});
router.post(
  "/upload",
  upload.single("image"),
  asyncRoute(async (req, res) => {
    if (
      !env.CLOUDINARY_API_SECRET ||
      !env.CLOUDINARY_CLOUD_NAME ||
      !env.CLOUDINARY_API_KEY
    )
      fail(
        "Configure Cloudinary credentials on the server to upload images",
        503,
      );
    const f = req.file,
      b = f?.buffer;
    const valid =
      b &&
      ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
        b
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        (b.toString("ascii", 0, 4) === "RIFF" &&
          b.toString("ascii", 8, 12) === "WEBP"));
    if (!valid) fail("Upload a JPEG, PNG or WebP image");
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rangvanaat",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (e, r) => (e ? reject(e) : resolve(r)),
      );
      stream.end(b);
    });
    ok(
      res,
      {
        url: result.secure_url,
        publicId: result.public_id,
        alt: text(f.originalname, 200),
      },
      201,
    );
  }),
);
router.get(
  "/:kind",
  asyncRoute(async (req, res) => {
    const Model = models[req.params.kind];
    if (!Model) fail("Not found", 404);
    if(req.query.paginated === 'true') return ok(res, await paginatedList(Model, req.query, req.params.kind === 'products' ? ['title','slug','category','collectionId','variants.sku'] : req.params.kind === 'collections' ? ['name','collectionId','mood'] : ['code','discountType']));
    ok(res, await Model.find().sort({ createdAt: -1 }).limit(1000).lean());
  }),
);
router.post(
  "/:kind",
  asyncRoute(async (req, res) => {
    const Model = models[req.params.kind];
    if (!Model) fail("Not found", 404);
    const values = fields(req.params.kind, req.body);
    if (
      Model === Product &&
      !(await Collection.exists({ collectionId: values.collectionId }))
    )
      fail("Create the collection first");
    ok(res, await Model.create(values), 201);
  }),
);
router.put(
  "/:kind/:id",
  asyncRoute(async (req, res) => {
    const Model = models[req.params.kind];
    if (!Model) fail("Not found", 404);
    const doc = await Model.findById(req.params.id);
    if (!doc) fail("Not found", 404);
    const values = fields(req.params.kind, req.body);
    if (
      Model === Product &&
      !(await Collection.exists({ collectionId: values.collectionId }))
    )
      fail("Collection does not exist");
    if (Model === Product && req.body.__v !== doc.__v)
      fail("Product changed. Reload before editing to preserve stock", 409);
    if (Model === Collection && values.collectionId !== doc.collectionId)
      fail("Collection ID cannot change; create another collection instead");
    if (Model === Product) {
      const used = await Order.exists({
        "items.productId": doc._id,
        stockReserved: true,
        "fulfillment.status": {
          $in: ["received", "in_stitching", "dispatched"],
        },
      });
      if (
        used &&
        doc.variants.some(
          (v) => !values.variants.some((n) => n.size === v.size),
        )
      )
        fail(
          "Sizes on open orders cannot be removed; set stock to zero instead",
          409,
        );
    }
    Object.assign(doc, values);
    await doc.save();
    ok(res, doc);
  }),
);
router.delete(
  "/:kind/:id",
  asyncRoute(async (req, res) => {
    const Model = models[req.params.kind];
    if (!Model) fail("Not found", 404);
    const doc = await Model.findById(req.params.id);
    if (!doc) fail("Not found", 404);
    if (Model === Product) doc.isPublished = false;
    else doc.isActive = false;
    await doc.save();
    ok(res, doc);
  }),
);
export default router;
