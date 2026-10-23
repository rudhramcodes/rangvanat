import { Collection } from './collection.model.js';
import { Product } from '../products/product.model.js';

export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    // Attach product count to each collection
    const counts = await Product.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$collectionId', count: { $sum: 1 } } },
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const enriched = collections.map((c) => ({
      ...c,
      productCount: countMap[c.collectionId] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

export const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOne({
      collectionId: id.toLowerCase(),
      isActive: true,
    }).lean();

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const products = await Product.find({
      collectionId: id.toLowerCase(),
      isPublished: true,
    }).lean();

    res.json({
      success: true,
      data: {
        ...collection,
        products,
      },
    });
  } catch (err) {
    next(err);
  }
};
