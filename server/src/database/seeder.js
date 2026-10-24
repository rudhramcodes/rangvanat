import mongoose from "mongoose";
import { connectDB } from "./db.js";
import { Collection } from "../modules/collections/collection.model.js";
import { Product } from "../modules/products/product.model.js";
import { Settings } from "../modules/settings/settings.model.js";
import { COLLECTIONS, PRODUCTS } from "../../../src/lib/lookbook.js";
await connectDB();
try {
  for (const [index, c] of COLLECTIONS.entries())
    await Collection.updateOne(
      { collectionId: c.id },
      {
        $setOnInsert: {
          collectionId: c.id,
          name: c.name,
          mood: c.mood || c.name,
          coverImage: c.image || "",
          displayOrder: index,
          isActive: true,
        },
      },
      { upsert: true },
    );
  for (const p of PRODUCTS) {
    const slug = `${p.name}-${p.code}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await Product.updateOne(
      { slug },
      {
        $setOnInsert: {
          title: p.name,
          slug,
          collectionId: p.collection,
          category: p.category,
          price: 0,
          description: p.description || p.name,
          heritageCraftStory: p.specs?.join(" • ") || "",
          fabric: "Khadi",
          images: p.image ? [{ url: p.image, alt: p.name }] : [],
          variants: [
            { size: "M", sku: `${p.code}-M`, stock: 0, priceDelta: 0 },
          ],
          totalStock: 0,
          isPublished: false,
          isFeatured: false,
          leadTimeDays: 7,
        },
      },
      { upsert: true },
    );
  }
  await Settings.updateOne(
    { key: "store" },
    { $setOnInsert: { key: "store" } },
    { upsert: true, setDefaultsOnInsert: true },
  );
  console.log(
    "Catalog imported as unpublished drafts with zero stock. Add approved prices, sizes and inventory in /admin before publishing. Existing data was preserved.",
  );
} finally {
  await mongoose.disconnect();
}
