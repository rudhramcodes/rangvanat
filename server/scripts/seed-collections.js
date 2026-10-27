import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Collection } from '../src/modules/collections/collection.model.js';
import { collectionSeeds } from '../src/database/data/collections.js';

assert.equal(new Set(collectionSeeds.map(c => c.collectionId)).size, 6);
for (const c of collectionSeeds) {
  assert.ok(c.mood.length > 80 && c.mood.length <= 200, `Invalid description: ${c.collectionId}`);
  await new Collection(c).validate();
}
if (process.argv.includes('--check')) {
  console.log('Validated all six collection records, descriptions and image URLs.');
} else {
  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    for (const seed of collectionSeeds) {
      const { collectionId, name, mood, coverImage, displayOrder, isActive } = seed;
      const collection = { collectionId, name, mood, coverImage, displayOrder, isActive };
      await Collection.updateOne({ collectionId: collection.collectionId }, { $set: collection }, { upsert: true, runValidators: true });
      console.log(`Seeded ${collection.name}`);
    }
    const saved = await Collection.find({ collectionId: { $in: collectionSeeds.map(c => c.collectionId) } }).lean();
    assert.equal(saved.length, 6);
    for (const expected of collectionSeeds) {
      const actual = saved.find(c => c.collectionId === expected.collectionId);
      for (const key of ['name', 'mood', 'coverImage', 'displayOrder', 'isActive']) assert.equal(actual[key], expected[key]);
    }
    console.log('Verified six saved collections. Products and other collections were not changed.');
  } catch {
    console.error('Collection seed failed. Check database connectivity and permissions. Re-running safely updates the same six collection IDs.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
