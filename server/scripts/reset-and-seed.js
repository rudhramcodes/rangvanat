import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/database/db.js";
import { AdminUser } from "../src/modules/auth/admin.model.js";
import { Customer } from "../src/modules/auth/customer.model.js";
import { Product } from "../src/modules/products/product.model.js";
import { Collection } from "../src/modules/collections/collection.model.js";
import { Coupon } from "../src/modules/coupons/coupon.model.js";
import { Order } from "../src/modules/orders/order.model.js";
import { Settings } from "../src/modules/settings/settings.model.js";

async function resetAndSeed() {
  await connectDB();
  console.log("Connected to MongoDB. Resetting collections...");

  // Drop / Clear collections
  await Promise.all([
    AdminUser.deleteMany({}),
    Customer.deleteMany({}),
    Product.deleteMany({}),
    Collection.deleteMany({}),
    Coupon.deleteMany({}),
    Order.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  console.log("All existing database records cleared.");

  // 1. Seed Admin
  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const admin = await AdminUser.create({
    name: "Faiz Shaikh (Admin)",
    email: "webworksbyfaiz@gmail.com",
    passwordHash: adminPasswordHash,
    role: "superadmin",
    isActive: true,
  });
  console.log(`Admin created: ${admin.email}`);

  // 2. Seed Collections
  const collectionsData = [
    {
      collectionId: "flora",
      name: "The Flora Edit",
      mood: "Botanical dyes, hand-block lotus motifs, and sun-dried organic cottons.",
      coverImage: "/images/flora-editorial.png",
      displayOrder: 1,
      isActive: true,
    },
    {
      collectionId: "sacred",
      name: "The Sacred Edit",
      mood: "Temple borders, auspicious vermilion, and unbleached raw tussar weaves.",
      coverImage: "/images/bridal-edit.jpg",
      displayOrder: 2,
      isActive: true,
    },
    {
      collectionId: "folk",
      name: "The Folk Edit",
      mood: "Saurashtra tribal mirror work, kutchi stitches, and earthy terracotta palette.",
      coverImage: "/images/statement-edit.jpg",
      displayOrder: 3,
      isActive: true,
    },
    {
      collectionId: "heritage",
      name: "The Heritage Edit",
      mood: "Centuries-old 100-count charkha handspun weaves from the heart of Bardoli.",
      coverImage: "/images/heritage-main.jpg",
      displayOrder: 4,
      isActive: true,
    },
    {
      collectionId: "denim",
      name: "The Khadi Denim",
      mood: "Zero-chemical natural fermented indigo handloom denim with brass hardware.",
      coverImage: "/images/everyday-edit.jpg",
      displayOrder: 5,
      isActive: true,
    },
    {
      collectionId: "modern",
      name: "The Modern Edit",
      mood: "Structured jackets, flowy overlay tunics, and modern monochrome cuts.",
      coverImage: "/images/khadi-editorial-diptych.png",
      displayOrder: 6,
      isActive: true,
    },
  ];

  await Collection.insertMany(collectionsData);
  console.log(`Seeded ${collectionsData.length} Collections.`);

  // 3. Seed Products
  const productsData = [
    {
      title: "Marigold Hand-Block Chanderi Khadi Saree",
      slug: "marigold-hand-block-chanderi-saree",
      collectionId: "flora",
      category: "saree",
      price: 8450,
      compareAtPrice: 9900,
      description: "Crafted from fine 80-count handspun cotton interwoven with sheer Chanderi silk yarn. Hand-printed with wooden teak blocks using natural marigold petals and pomegranate peel extracts.",
      heritageCraftStory: "Woven by Master Weaver Devjibhai in Bardoli, Gujarat over 18 days of rigorous handloom rhythm.",
      fabric: "Khadi Cotton-Silk Blend",
      craft: "Wooden Block Print & Handloom Weave",
      washCare: "Strictly Dry Clean or Gentle Hand Wash in cold water with mild reetha liquid.",
      madeToOrder: false,
      isFeatured: true,
      isPublished: true,
      images: [
        { url: "/images/flora-editorial.png", alt: "Marigold Hand-Block Saree Pallu View" },
        { url: "/images/spinning.jpg", alt: "Marigold Hand-Block Saree Drape" },
      ],
      variants: [
        { size: "Free Size", sku: "RV-FL-001-FS", priceDelta: 0, stock: 4 },
        { size: "Custom", sku: "RV-FL-001-CST", priceDelta: 500, stock: 10 },
      ],
    },
    {
      title: "Vermilion Temple-Border Tussar Kurta",
      slug: "vermilion-temple-border-tussar-kurta",
      collectionId: "sacred",
      category: "kurta",
      price: 6200,
      compareAtPrice: 7200,
      description: "A ceremonial calf-length silhouette adorned with gold zari-woven temple motifs along the placket and side slits. Lined with ultra-soft organic voile for all-day comfort.",
      heritageCraftStory: "Embellished by women artisans in Saurashtra preserving sacred geometric embroidery traditions.",
      fabric: "Raw Tussar Khadi Silk",
      craft: "Zari Jamdani & Resham Stitch",
      washCare: "Dry Clean Only",
      madeToOrder: false,
      isFeatured: true,
      isPublished: true,
      images: [
        { url: "/images/bridal-edit.jpg", alt: "Vermilion Kurta Front Detail" },
        { url: "/images/artisan2.jpg", alt: "Vermilion Kurta Weave Close-up" },
      ],
      variants: [
        { size: "S", sku: "RV-SC-002-S", priceDelta: 0, stock: 3 },
        { size: "M", sku: "RV-SC-002-M", priceDelta: 0, stock: 5 },
        { size: "L", sku: "RV-SC-002-L", priceDelta: 0, stock: 2 },
        { size: "XL", sku: "RV-SC-002-XL", priceDelta: 0, stock: 4 },
        { size: "Custom", sku: "RV-SC-002-CST", priceDelta: 600, stock: 8 },
      ],
    },
    {
      title: "Kutchi Mirror-Work Handloom Overcoat",
      slug: "kutchi-mirror-work-handloom-overcoat",
      collectionId: "folk",
      category: "jacket",
      price: 11500,
      compareAtPrice: 13000,
      description: "An heirloom outer garment woven on pit looms using coarse 20s organic cotton yarn, featuring hand-embroidered Abhla (convex mirror) motifs across the yoke and cuffs.",
      heritageCraftStory: "Hand-stitched by the Meghwal artisan collective using needlework motifs handed down 4 generations.",
      fabric: "Coarse Organic Khadi Cotton",
      craft: "Kutchi Mirror Work & Needlepoint",
      washCare: "Specialist Dry Clean Only",
      madeToOrder: true,
      isFeatured: true,
      isPublished: true,
      images: [
        { url: "/images/statement-edit.jpg", alt: "Kutchi Mirror-Work Overcoat" },
        { url: "/images/artisan1.jpg", alt: "Kutchi Mirror-Work Stitch Detail" },
      ],
      variants: [
        { size: "S", sku: "RV-FK-003-S", priceDelta: 0, stock: 1 },
        { size: "M", sku: "RV-FK-003-M", priceDelta: 0, stock: 2 },
        { size: "L", sku: "RV-FK-003-L", priceDelta: 0, stock: 2 },
        { size: "Custom", sku: "RV-FK-003-CST", priceDelta: 1000, stock: 5 },
      ],
    },
    {
      title: "Natural Indigo Artisan Handloom Denim Jacket",
      slug: "natural-indigo-artisan-denim-jacket",
      collectionId: "denim",
      category: "jacket",
      price: 9800,
      compareAtPrice: 11200,
      description: "14oz selvedge Khadi denim hand-woven on wooden shuttle looms with yarn dip-dyed 16 times in naturally fermented indigo vats. Detailed with hand-turned brass buttons.",
      heritageCraftStory: "Bridging Gandhi's charkha with modern bespoke street couture, using zero chemical fixatives.",
      fabric: "100% Khadi Indigo Selvedge Denim",
      craft: "Vat-Dyed Handloom Weaving",
      washCare: "Cold Wash separately inside out. Indigo will naturally age like fine wine.",
      madeToOrder: false,
      isFeatured: true,
      isPublished: true,
      images: [
        { url: "/images/everyday-edit.jpg", alt: "Natural Indigo Denim Jacket" },
        { url: "/images/dyeing.jpg", alt: "Natural Fermented Indigo Vat Dyeing" },
      ],
      variants: [
        { size: "S", sku: "RV-DN-004-S", priceDelta: 0, stock: 2 },
        { size: "M", sku: "RV-DN-004-M", priceDelta: 0, stock: 4 },
        { size: "L", sku: "RV-DN-004-L", priceDelta: 0, stock: 3 },
        { size: "XL", sku: "RV-DN-004-XL", priceDelta: 0, stock: 1 },
      ],
    },
    {
      title: "Pure Handspun Charkha Khadi Dupatta",
      slug: "pure-handspun-charkha-dupatta",
      collectionId: "heritage",
      category: "dupatta",
      price: 4500,
      compareAtPrice: 5200,
      description: "A diaphanous 2.5-meter wrap in featherlight 100-count unbleached muslin cotton with hand-twisted tassels and delicate woven selvedges.",
      heritageCraftStory: "Spun in rural Gujarat by senior master spinners using amber charkhas.",
      fabric: "100-Count Pure Khadi Muslin",
      craft: "Fine Amber Charkha Handspin",
      washCare: "Gentle Hand Wash in cold water",
      madeToOrder: false,
      isFeatured: false,
      isPublished: true,
      images: [
        { url: "/images/heritage-main.jpg", alt: "Pure Charkha Dupatta" },
        { url: "/images/heritage-detail.jpg", alt: "Dupatta Selvedge Detail" },
      ],
      variants: [
        { size: "Free Size", sku: "RV-HR-005-FS", priceDelta: 0, stock: 6 },
      ],
    },
    {
      title: "Contemporary Minimalist Asymmetrical Kurta",
      slug: "contemporary-minimalist-asymmetrical-kurta",
      collectionId: "modern",
      category: "kurta",
      price: 5800,
      compareAtPrice: 6500,
      description: "Monochrome slate-grey handloom tunic with an architectural high-low hemline, concealed coconut-shell buttons, and deep in-seam pockets.",
      heritageCraftStory: "Designed for the global conscious nomad who values breathable luxury.",
      fabric: "Mid-Weight Khadi Cotton Linen",
      craft: "Treadle Loom Weave",
      washCare: "Machine wash gentle cycle cold",
      madeToOrder: false,
      isFeatured: false,
      isPublished: true,
      images: [
        { url: "/images/khadi-editorial-diptych.png", alt: "Minimalist Asymmetrical Kurta" },
        { url: "/images/finishing.jpg", alt: "Hand-finished tailored seams" },
      ],
      variants: [
        { size: "S", sku: "RV-MD-006-S", priceDelta: 0, stock: 3 },
        { size: "M", sku: "RV-MD-006-M", priceDelta: 0, stock: 5 },
        { size: "L", sku: "RV-MD-006-L", priceDelta: 0, stock: 4 },
        { size: "Custom", sku: "RV-MD-006-CST", priceDelta: 500, stock: 6 },
      ],
    },
  ];

  await Product.insertMany(productsData);
  console.log(`Seeded ${productsData.length} Products with variants and inventory.`);

  // 4. Seed Coupons
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const couponsData = [
    {
      code: "KHADI10",
      discountType: "percentage",
      discountValue: 10,
      minCartValue: 2000,
      maxDiscountCap: 1500,
      expiryDate: oneYearFromNow,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: "RANGVANAT500",
      discountType: "fixed",
      discountValue: 500,
      minCartValue: 4000,
      maxDiscountCap: 500,
      expiryDate: oneYearFromNow,
      usageLimit: 200,
      isActive: true,
    },
  ];
  await Coupon.insertMany(couponsData);
  console.log(`Seeded ${couponsData.length} Promotional Coupons.`);

  // 5. Seed Store Settings
  await Settings.create({
    key: "store",
    name: "Rangvanaat",
    description: "Handcrafted khadi. Made to be lived in.",
    logo: "/images/logo-only.svg",
    announcement: "Complimentary Handloom Gift Box on orders above ₹5,000 | Worldwide Insured Shipping",
    contactEmail: "orders@rangvanat.com",
    phone: "+91 90238 27460",
    freeShippingThreshold: 5000,
    shippingFee: 250,
  });
  console.log("Storefront Settings initialized.");

  console.log("\n==========================================");
  console.log("✨ DATABASE RESET & SEEDING COMPLETED ✨");
  console.log("Superadmin Login: webworksbyfaiz@gmail.com / Admin@123");
  console.log("==========================================");
}

try {
  await resetAndSeed();
} catch (err) {
  console.error("Seeding failed:", err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
