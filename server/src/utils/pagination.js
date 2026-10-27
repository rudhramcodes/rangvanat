import { escapeRegex } from './validate.js';
export async function paginatedList(Model, query, fields, projection = '') {
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 12));
  const requested = Math.max(1, Math.min(100000, parseInt(query.page, 10) || 1));
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : '';
  const filter = search ? { $or: fields.map(field => ({ [field]: new RegExp(escapeRegex(search), 'i') })) } : {};
  const total = await Model.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(requested, pages);
  const rows = await Model.find(filter).select(projection).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean();
  return { rows, pagination: { page, limit, total, pages } };
}
