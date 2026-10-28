import { apiUrl } from '../lib/apiBase.js';

export async function fetchJson(endpoint, options = {}) {
  try {
    const headers = new Headers(options.headers);
    headers.set('Content-Type','application/json');
    const token = localStorage.getItem('rv_token');
    if(token) headers.set('Authorization',`Bearer ${token}`);
    const res = await fetch(apiUrl(endpoint), {...options,headers});
    const data = await res.json();
    return {...data,status:res.status};
  } catch { return {success:false,message:'Unable to connect. Please try again.'}; }
}

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.collection && params.collection !== 'all') query.set('collection', params.collection);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.minPrice != null) query.set('minPrice', params.minPrice);
    if (params.maxPrice != null) query.set('maxPrice', params.maxPrice);
    if (params.inStock) query.set('inStock', 'true');
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const res = await fetchJson(`/products?${query.toString()}`);
    if (res?.success) return res.data;

    return { products: [], pagination: {total:0,hasMore:false}, error: res?.message || 'Catalog unavailable. Please try again.' };
  },

  async getBestsellers() {
    const res = await fetchJson('/products/bestsellers');
    if (res?.success && res.data?.length) return res.data;
    return [];
  },

  async getFeaturedProducts() {
    const res = await fetchJson('/products/featured');
    if (res?.success && res.data?.length) return res.data;
    return [];
  },

  async getProductByIdOrSlug(idOrSlug) {
    const res = await fetchJson(`/products/${encodeURIComponent(idOrSlug)}`);
    if (res?.success && res.data) return res.data;
    return null;
  },

  async getRelatedProducts(idOrSlug) {
    const res = await fetchJson(`/products/${encodeURIComponent(idOrSlug)}/related`);
    if (res?.success && res.data?.length) return res.data;
    return [];
  },

  // Collections
  async getCollections() {
    const res = await fetchJson('/collections');
    if (res?.success && res.data?.length) return res.data;
    return [];
  },

  // Orders & Tracking
  async createOrder(orderPayload, key) {
    const res = await fetchJson('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
      headers: {'Idempotency-Key': key},
    });
    return res;
  },

  async getOrderByNumber(orderNumber, accessToken) {
    return fetchJson(`/orders/${encodeURIComponent(orderNumber)}`, {headers:{"X-Order-Token":accessToken || ""}});
  },

  async trackOrder(orderNumber, accessToken) {
    return fetchJson('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderNumber, accessToken }),
    });
  },

  async createRazorpayOrder(orderNumber) {
    return fetchJson(`/orders/${encodeURIComponent(orderNumber)}/pay/razorpay`, {
      method: 'POST',
    });
  },

  async verifyRazorpayPayment(orderNumber, paymentData) {
    return fetchJson(`/orders/${encodeURIComponent(orderNumber)}/pay/razorpay/verify`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async confirmCodOrder(orderNumber, accessToken) {
    return fetchJson(`/orders/${encodeURIComponent(orderNumber)}/pay/cod`, {
      method: 'POST',
      headers: { "X-Order-Token": accessToken || "" },
    });
  },

  async quoteCart(payloadOrItems, couponCode = '', pincode = '') {
    let body;
    if (Array.isArray(payloadOrItems)) {
      body = { items: payloadOrItems, couponCode, pincode };
    } else if (payloadOrItems && typeof payloadOrItems === 'object') {
      body = payloadOrItems;
    } else {
      body = { items: [] };
    }
    const res = await fetchJson('/cart/quote', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res?.success && res.data) {
      return {
        ...res,
        ...res.data,
        financials: res.data.financials,
        discountAmount: res.data.financials?.discountAmount || 0,
        shippingFee: res.data.financials?.shippingFee || 0,
        totalAmount: res.data.financials?.totalAmount || 0,
      };
    }
    return res;
  },

  quote(items, couponCode = '', pincode = '') {
    return this.quoteCart(items, couponCode, pincode);
  },

  settings() { return fetchJson('/settings'); },

  delivery(pin) { return fetchJson(`/delivery/${encodeURIComponent(pin)}`); },
  checkDelivery(pin) { return fetchJson(`/delivery/${encodeURIComponent(pin)}`); },

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
  async me() {
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
