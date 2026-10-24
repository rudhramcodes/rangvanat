import { Product } from './product.model.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      collection,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 24,
    } = req.query;

    const query = { isPublished: true };

    if (collection && collection !== 'all') {
      query.collectionId = collection.toLowerCase();
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.totalStock = { $gt: 0 };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { heritageCraftStory: searchRegex },
      ];
    }

    let sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'title') sortOption = { title: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum),
          hasMore: pageNum * limitNum < totalCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    let products = await Product.find({ isPublished: true, isFeatured: true }).limit(8).lean();
    if (!products.length) {
      products = await Product.find({ isPublished: true }).limit(8).lean();
    }
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getBestsellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isPublished: true }).sort({ totalStock: -1 }).limit(8).lean();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).lean();
    }

    if (!product) {
      product = await Product.findOne({ slug: identifier.toLowerCase() }).lean();
    }

    if (!product) {
      // Also fallback search in code or partial slug match
      product = await Product.findOne({
        $or: [
          { 'images.publicId': identifier.toUpperCase() },
          { slug: new RegExp(identifier, 'i') },
        ],
      }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const base = await Product.findOne({
      $or: [
        { slug: identifier.toLowerCase() },
        ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : []),
      ],
    }).lean();

    const query = { isPublished: true };
    if (base) {
      query._id = { $ne: base._id };
      query.$or = [{ collectionId: base.collectionId }, { category: base.category }];
    }

    const related = await Product.find(query).limit(4).lean();
    res.json({ success: true, data: related });
  } catch (err) {
    next(err);
  }
};
