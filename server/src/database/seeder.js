import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB } from './db.js';
import { Collection } from '../modules/collections/collection.model.js';
import { Product } from '../modules/products/product.model.js';
import { AdminUser } from '../modules/auth/admin.model.js';
import { Coupon } from '../modules/coupons/coupon.model.js';
import { COLLECTIONS, PRODUCTS } from '../../../src/lib/lookbook.js';

// Base pricing map by category for luxury handloom pieces
const CATEGORY_PRICING = {
  'Designer Fabric': { price: 5500, compareAt: 7000 },
  'Corset': { price: 7800, compareAt: 9500 },
  'Co-ord Set': { price: 14500, compareAt: 18000 },
  'Jacket': { price: 16500, compareAt: 21000 },
  'Dress': { price: 12500, compareAt: 15500 },
  'Skirt & Top': { price: 13500, compareAt: 16500 },
  'Bottom': { price: 6500, compareAt: 8000 },
  'Saree': { price: 18500, compareAt: 24000 },
  'Dupatta': { price: 4800, compareAt: 6000 },
  "Men's Wear": { price: 9500, compareAt: 12000 },
};

const createSlug = (text, code) => {
  return `${text}-${code}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old collections, products, coupons, and admins...');
    await Promise.all([
      Collection.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      AdminUser.deleteMany({}),
    ]);

    // 1. Seed Collections
    console.log(`[Seeder] Seeding ${COLLECTIONS.length} master collections...`);
    const collectionsToInsert = COLLECTIONS.map((c, index) => ({
      collectionId: c.id,
      name: c.name,
      mood: c.mood,
      coverImage: c.image || '',
      displayOrder: index + 1,
      isActive: true,
    }));
    await Collection.insertMany(collectionsToInsert);
    console.log('[Seeder] Master collections seeded.');

    // 2. Seed Products with Variants & Stock
    console.log(`[Seeder] Seeding ${PRODUCTS.length} handcrafted products...`);
    const productsToInsert = PRODUCTS.map((p) => {
      const priceConfig = CATEGORY_PRICING[p.category] || { price: 8500, compareAt: 10500 };
      const isFabricOrDrape = ['Designer Fabric', 'Saree', 'Dupatta'].includes(p.category);

      const variants = isFabricOrDrape
        ? [{ size: 'Standard Fabric', sku: `${p.code}-STD`, stock: 15, priceDelta: 0 }]
        : [
            { size: 'XS', sku: `${p.code}-XS`, stock: 4, priceDelta: 0 },
            { size: 'S', sku: `${p.code}-S`, stock: 6, priceDelta: 0 },
            { size: 'M', sku: `${p.code}-M`, stock: 8, priceDelta: 0 },
            { size: 'L', sku: `${p.code}-L`, stock: 6, priceDelta: 0 },
            { size: 'XL', sku: `${p.code}-XL`, stock: 4, priceDelta: 0 },
            { size: 'Custom', sku: `${p.code}-CST`, stock: 10, priceDelta: 1500 },
          ];

      return {
        title: p.name,
        slug: createSlug(p.name, p.code),
        collectionId: p.collection,
        category: p.category,
        price: priceConfig.price,
        compareAtPrice: priceConfig.compareAt,
        description: p.description,
        heritageCraftStory: p.specs ? p.specs.join(' • ') : '',
        washCare: 'Dry clean only to preserve authentic Khadi natural weave and colors.',
        images: [
          {
            url: p.image || 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVF-01.avif',
            publicId: p.code,
            alt: p.name,
          },
        ],
        variants,
        totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
        isPublished: true,
        isFeatured: ['rvf-01', 'rvf-02', 'rvf-07'].includes(p.id),
        leadTimeDays: isFabricOrDrape ? 3 : 7,
      };
    });

    await Product.insertMany(productsToInsert);
    console.log('[Seeder] All products seeded successfully.');

    // 3. Seed Default Admin
    console.log('[Seeder] Creating default Super Admin...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await AdminUser.create({
      name: 'Rangvanaat Admin',
      email: 'admin@rangvanat.com',
      passwordHash,
      role: 'superadmin',
      isActive: true,
    });
    console.log('[Seeder] Admin created: admin@rangvanat.com / admin123');

    // 4. Seed Welcome Coupon
    console.log('[Seeder] Creating welcome coupon...');
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minCartValue: 5000,
      maxDiscountCap: 2500,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year validity
      usageLimit: 500,
      isActive: true,
    });
    console.log('[Seeder] Coupon created: WELCOME10 (10% off)');

    console.log('----------------------------------------------------');
    console.log('✦ Database Seeding Completed Successfully! ✦');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
