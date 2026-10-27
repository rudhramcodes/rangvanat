import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Product } from '../src/modules/products/product.model.js';
import { Settings } from '../src/modules/settings/settings.model.js';
import { productSeeds } from '../src/database/data/products.js';

const prices = { 'Designer Fabric': 2450, Corset: 4250, 'Co-ord Set': 7250, Jacket: 5950, Dress: 5450, Bottom: 3250, Saree: 8450, Dupatta: 2850, "Men's Wear": 4950 };
const featured = new Set(['RVCS-03', 'RVJ-03', 'RVD-03', 'RVS-01']);
const demos = productSeeds.map((p, index) => {
  const code = p.variants[0].sku.replace('-DRAFT', '');
  const oneSize = ['Designer Fabric', 'Saree', 'Dupatta'].includes(p.category);
  const sizes = p.category === 'Designer Fabric' ? ['1 metre'] : oneSize ? ['One size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const variants = sizes.map((size, i) => ({ size, sku: `${code}-${size.toUpperCase().replaceAll(' ', '-')}`, stock: 6 + ((index + i) % 9), priceDelta: 0 }));
  return { ...p, price: prices[p.category] + (index % 3) * 250, compareAtPrice: null, variants, totalStock: variants.reduce((n, v) => n + v.stock, 0), isPublished: true, isFeatured: featured.has(code), salesPaused: false,
    sizeGuide: oneSize ? (p.category === 'Designer Fabric' ? 'Demo: sold per metre; sample width 44 inches.' : 'Demo: one size. Sample saree length 5.5 m; dupatta length 2.25 m. Confirm actual dimensions before sale.') : 'Demo body measurements in inches (chest/bust – waist – hip): XS 32–26–34; S 34–28–36; M 36–30–38; L 38–32–40; XL 40–34–42; XXL 42–36–44. Sample fit only.',
    washCare: 'Demo care guidance: gentle cold hand wash, dry in shade and iron on low heat. Actual garment instructions require confirmation.', leadTimeDays: 3 };
});
for (const p of demos) { await new Product(p).validate(); assert.ok(p.price > 0); assert.equal(p.totalStock, p.variants.reduce((n,v)=>n+v.stock,0)); }
assert.equal(demos.filter(p=>p.isFeatured).length,4);
if (process.argv.includes('--check')) console.log('Validated 33 demo products, prices, sizes, stock and four featured pieces.');
else {
  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    // Enable the server-side order block before publishing sample stock.
    await Settings.updateOne({key:'store'}, {$set:{demoMode:true}}, {upsert:true});
    for (const p of demos) await Product.updateOne({slug:p.slug}, {$set:p}, {upsert:true,runValidators:true});
    const records = await Product.find({slug:{$in:demos.map(p=>p.slug)}}).lean();
    assert.equal(records.length,33);
    for (const p of records) { assert.ok(p.isPublished && p.price>0 && p.totalStock>0); assert.equal(p.images.length,3); }
    assert.equal(records.filter(p=>p.isFeatured).length,4);
    console.log('Published and verified 33 demo products with prices, sizes and stock. Four featured on Home. Demo order/payment block enabled.');
  } catch { console.error('Demo seed failed; check database connectivity. Safe to rerun.'); process.exitCode=1; }
  finally { await mongoose.disconnect(); }
}
