import { COLLECTIONS as LOCAL_COLLECTIONS, PRODUCTS as LOCAL_PRODUCTS, BRAND_STORY } from '../lib/lookbook.js';

const API_BASE = '/api';

/**
 * Robust API helper with JSON error handling and fallback
 */
async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('rv_token') ? { Authorization: `Bearer ${localStorage.getItem('rv_token')}` } : {}),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[API] Fallback for ${endpoint}:`, err.message);
    return null;
  }
}

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.collection && params.collection !== 'all') query.set('collection', params.collection);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    if (params.inStock) query.set('inStock', 'true');
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const res = await fetchJson(`/products?${query.toString()}`);
    if (res?.success) return res.data;

    // Local fallback if API is starting
    let filtered = [...LOCAL_PRODUCTS];
    if (params.collection && params.collection !== 'all') {
      filtered = filtered.filter((p) => p.collection === params.collection);
    }
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return {
      products: filtered,
      pagination: { total: filtered.length, page: 1, limit: filtered.length, pages: 1, hasMore: false },
    };
  },

  async getBestsellers() {
    const res = await fetchJson('/products/bestsellers');
    if (res?.success && res.data?.length) return res.data;
    return LOCAL_PRODUCTS.slice(0, 8);
  },

  async getFeaturedProducts() {
    const res = await fetchJson('/products/featured');
    if (res?.success && res.data?.length) return res.data;
    return LOCAL_PRODUCTS.filter((p) => ['rvf-01', 'rvf-02', 'rvf-07', 'rvs-01'].includes(p.id));
  },

  async getProductByIdOrSlug(idOrSlug) {
    const res = await fetchJson(`/products/${idOrSlug}`);
    if (res?.success && res.data) return res.data;
    return (
      LOCAL_PRODUCTS.find((p) => p.id === idOrSlug || p.code?.toLowerCase() === idOrSlug.toLowerCase()) ||
      LOCAL_PRODUCTS[0]
    );
  },

  async getRelatedProducts(idOrSlug) {
    const res = await fetchJson(`/products/${idOrSlug}/related`);
    if (res?.success && res.data?.length) return res.data;
    return LOCAL_PRODUCTS.slice(1, 5);
  },

  // Collections
  async getCollections() {
    const res = await fetchJson('/collections');
    if (res?.success && res.data?.length) return res.data;
    return LOCAL_COLLECTIONS.map((c) => ({
      collectionId: c.id,
      name: c.name,
      mood: c.mood,
      coverImage: c.image || '',
      productCount: c.count || 6,
    }));
  },

  // Orders & Tracking
  async createOrder(orderPayload) {
    const res = await fetchJson('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return res;
  },

  async getOrderByNumber(orderNumber) {
    return fetchJson(`/orders/${orderNumber}`);
  },

  async trackOrder(orderNumber, contact) {
    return fetchJson('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderNumber, contact }),
    });
  },

  // Coupons
  async validateCoupon(code, cartTotal) {
    return fetchJson('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal }),
    });
  },

  // Customer Auth
  async register(data) {
    return fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data) {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return fetchJson('/auth/me');
  },

  async updateProfile(updates) {
    return fetchJson('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Storefront
  async subscribeNewsletter(email) {
    return fetchJson('/storefront/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async submitEnquiry(enquiry) {
    return fetchJson('/storefront/enquiry', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    });
  },

  async getStats() {
    const res = await fetchJson('/storefront/stats');
    if (res?.success) return res.data;
    return {
      artisansCount: '200+',
      generations: '3',
      craftType: '100% Handloom',
      cluster: '1 Village Cluster',
    };
  },
};
