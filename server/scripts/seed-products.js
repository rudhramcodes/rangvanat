import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Product } from '../src/modules/products/product.model.js';
import { Collection } from '../src/modules/collections/collection.model.js';
import { productSeeds } from '../src/database/data/products.js';
import { collectionSeeds } from '../src/database/data/collections.js';

assert.equal(productSeeds.length, 33);
assert.equal(new Set(productSeeds.map(p => p.slug)).size, 33);
for (const p of productSeeds) {
  assert.equal(new Set(p.images.map(i => i.url)).size, 3);
  assert.ok(p.description && p.seoTitle && p.seoDescription && p.sizeGuide && p.washCare);
  assert.ok(collectionSeeds.some(c => c.collectionId === p.collectionId));
  await new Product(p).validate();
}
if (process.argv.includes('--check')) {
  console.log('Validated 33 draft products and 99 image references.');
} else {
  try {
    // Validate remote assets before any writes; a failed photo must not partially seed a catalog.
    for (const url of new Set(productSeeds.flatMap(p => p.images.map(i => i.url)))) {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      assert.ok(r.ok && r.headers.get('content-type')?.startsWith('image/'), `Image unavailable: ${url}`);
    }
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    for (const { collectionId, name, mood, coverImage, displayOrder, isActive } of collectionSeeds) {
      await Collection.updateOne({ collectionId }, { $setOnInsert: { collectionId, name, mood, coverImage, displayOrder, isActive } }, { upsert: true });
    }
    let inserted = 0;
    for (const product of productSeeds) {
      const result = await Product.updateOne({ slug: product.slug }, { $setOnInsert: product }, { upsert: true, runValidators: true });
      inserted += result.upsertedCount;
    }
    const count = await Product.countDocuments({ slug: { $in: productSeeds.map(p => p.slug) } });
    assert.equal(count, 33);
    console.log(`Catalog verified: ${count} products; ${inserted} inserted. Existing records preserved.`);
  } catch (error) {
    console.error('Product seeding failed:', error.name, 'Check image availability and database connectivity. Re-running is safe.');
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
