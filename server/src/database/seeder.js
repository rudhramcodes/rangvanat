import mongoose from "mongoose";
import { connectDB } from "./db.js";
import { Collection } from "../modules/collections/collection.model.js";
import { Product } from "../modules/products/product.model.js";
import { Settings } from "../modules/settings/settings.model.js";
import { productSeeds } from "./data/products.js";
import { collectionSeeds } from "./data/collections.js";
await connectDB();
try {
  for (const c of collectionSeeds)
    await Collection.updateOne(
      { collectionId: c.collectionId },
      {
        $setOnInsert: {
          collectionId: c.collectionId,
          name: c.name,
          mood: c.mood || c.name,
          coverImage: c.coverImage,
          displayOrder: c.displayOrder,
          isActive: true,
        },
      },
      { upsert: true },
    );
  for (const product of productSeeds) {
    await Product.updateOne(
      { slug: product.slug },
      { $setOnInsert: product },
      { upsert: true, runValidators: true },
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
