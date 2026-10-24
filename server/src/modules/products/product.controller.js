import { Product } from "./product.model.js";
import { fail, text, escapeRegex } from "../../utils/validate.js";
export const getProducts = async (req, res, next) => {
  try {
    const b = req.query,
      query = { isPublished: true };
    for (const [param, field] of [
      ["collection", "collectionId"],
      ["category", "category"],
      ["fabric", "fabric"],
      ["craft", "craft"],
    ])
      if (typeof b[param] === "string" && b[param] !== "all")
        query[field] = text(b[param], 100);
    if (typeof b.search === "string" && b.search.trim()) {
      const regex = new RegExp(escapeRegex(text(b.search, 100)), "i");
      query.$or = ["title", "description", "category", "fabric", "craft"].map(
        (k) => ({ [k]: regex }),
      );
    }
    if (b.minPrice !== undefined || b.maxPrice !== undefined) {
      query.price = {};
      for (const [param, op] of [
        ["minPrice", "$gte"],
        ["maxPrice", "$lte"],
      ])
        if (b[param] !== undefined) {
          const n = Number(b[param]);
          if (!Number.isFinite(n) || n < 0) fail("Invalid price filter");
          query.price[op] = n;
        }
    }
    if (b.inStock === "true") {
      query.salesPaused = { $ne: true };
      query.$and = [
        { $or: [{ totalStock: { $gt: 0 } }, { madeToOrder: true }] },
      ];
    }
    const page = Math.max(1, Math.min(10000, Number.parseInt(b.page, 10) || 1)),
      limit = Math.max(1, Math.min(100, Number.parseInt(b.limit, 10) || 24));
    const sort = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      title: { title: 1 },
    }[b.sort] || { isFeatured: -1, createdAt: -1 };
    const [products, total, facets] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: { isPublished: true } },
        {
          $group: {
            _id: null,
            categories: { $addToSet: "$category" },
            fabrics: { $addToSet: "$fabric" },
            crafts: { $addToSet: "$craft" },
          },
        },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        products,
        facets: facets[0] || { categories: [], fabrics: [], crafts: [] },
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};
export const getFeaturedProducts = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await Product.find({ isPublished: true, isFeatured: true })
        .limit(8)
        .lean(),
    });
  } catch (e) {
    next(e);
  }
};
export const getBestsellers = getFeaturedProducts;
export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const id = req.params.identifier;
    const product = await Product.findOne({
      isPublished: true,
      ...(/^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id }),
    }).lean();
    if (!product) fail("Product not found", 404);
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
};
export const getRelatedProducts = async (req, res, next) => {
  try {
    const base = await Product.findOne({
      slug: req.params.identifier,
      isPublished: true,
    });
    res.json({
      success: true,
      data: base
        ? await Product.find({
            _id: { $ne: base._id },
            isPublished: true,
            collectionId: base.collectionId,
          })
            .limit(4)
            .lean()
        : [],
    });
  } catch (e) {
    next(e);
  }
};
