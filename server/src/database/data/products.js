import { PRODUCTS } from '../../../../src/lib/lookbook.js';

// Stock references are for draft layout previews, not evidence of the actual garment.
export const productPhotoSources = {
  fabric: [7232405, 352899, 10566050],
  corset: [18332218, 7232405, 9314608],
  coord: [31400265, 7959596, 7232405],
  jacket: [23531833, 3888214, 7232405],
  denim: [28174872, 7582114, 7641026],
  dress: [31556429, 12579930, 17071186],
  bottom: [31400265, 28174872, 7232405],
  saree: [28943610, 2723623, 352899],
  dupatta: [19963482, 10566050, 352899],
  mens: [5975299, 18073687, 7641026],
};
const categoryGroup = { 'Designer Fabric': 'fabric', Corset: 'corset', 'Co-ord Set': 'coord', Jacket: 'jacket', Dress: 'dress', Bottom: 'bottom', Saree: 'saree', Dupatta: 'dupatta', "Men's Wear": 'mens' };
export const productSeeds = PRODUCTS.map(p => {
  const group = p.collection === 'denim' && p.category !== "Men's Wear" ? 'denim' : categoryGroup[p.category];
  if (!group) throw new Error(`Missing image selection for ${p.code}`);
  return {
    title: p.name,
    slug: `${p.name}-${p.code}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    collectionId: p.collection,
    category: p.category,
    description: [p.description, p.tagline, 'Design references: ' + (p.inspiredBy || []).join('; '), 'Specifications: ' + (p.specs || []).join('; ')].filter(Boolean).join('\n\n'),
    heritageCraftStory: (p.inspiredBy || []).join('. ') + '. ' + (p.specs || []).join(' • '),
    fabric: p.specs?.find(s => /khadi/i.test(s)) || 'Khadi',
    craft: (p.specs || []).filter(s => /print|embroider|mirror|paint|weav|woven|jamdani|patola/i.test(s)).join(' • '),
    sizeGuide: 'Measurements and available sizes must be confirmed with the atelier before publication.',
    seoTitle: `${p.name} | Rangvanat`,
    seoDescription: p.description.slice(0, 157) + (p.description.length > 157 ? '…' : ''),
    washCare: 'Care instructions pending confirmation for this piece. Follow its garment label.',
    images: productPhotoSources[group].map((id, index) => ({ url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85`, alt: `Stock styling reference ${index + 1} for ${p.category}; not the actual ${p.name}`, publicId: '' })),
    price: 0,
    compareAtPrice: null,
    variants: [{ size: 'Pending confirmation', sku: `${p.code}-DRAFT`, stock: 0, priceDelta: 0 }],
    totalStock: 0,
    isPublished: false,
    isFeatured: false,
    madeToOrder: false,
    salesPaused: true,
    leadTimeDays: 7,
  };
});
