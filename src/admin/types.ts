export type Variant = {
  _id?: string;
  size: string;
  sku: string;
  stock: number;
  priceDelta: number;
};
export type Photo = { url: string; alt: string; publicId?: string };
export type Product = {
  salesPaused?: boolean;
  _id: string;
  __v?: number;
  title: string;
  slug: string;
  collectionId: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  heritageCraftStory: string;
  washCare: string;
  fabric: string;
  craft: string;
  sizeGuide: string;
  seoTitle?: string;
  seoDescription?: string;
  images: Photo[];
  variants: Variant[];
  totalStock: number;
  isPublished: boolean;
  isFeatured: boolean;
  madeToOrder: boolean;
  leadTimeDays: number;
};
export type Collection = {
  _id: string;
  collectionId: string;
  name: string;
  mood: string;
  coverImage: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
};
export type Page = {
  slug: string;
  title: string;
  body: string;
  published: boolean;
};
export type Section = {
  title: string;
  body: string;
  image: string;
  href: string;
  enabled: boolean;
};
export type Settings = {
  navigation: { label: string; href: string }[];
  name: string;
  description: string;
  logo: string;
  favicon: string;
  announcement: string;
  heroTitle: string;
  heroText: string;
  heroVideo: string;
  heroImage: string;
  contactEmail: string;
  phone: string;
  instagram: string;
  address: string;
  shippingFee: number;
  freeShippingThreshold: number;
  deliveryDays: number;
  lowStockThreshold: number;
  serviceablePrefixes: string[];
  pages: Page[];
  sections: Section[];
};
export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  title: string;
  image: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  customMeasurements: Record<string, string>;
};
export type Financials = {
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
};
export type Quote = {
  items: {
    productId: string;
    productTitle: string;
    image: string;
    variantSize: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  financials: Financials;
  deliveryDays: number;
};
export type Order = {
  _id: string;
  orderNumber: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    shippingAddress?: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: Quote["items"];
  financials: Financials;
  payment: { status: string };
  fulfillment: {
    status: string;
    courierPartner: string;
    trackingNumber: string;
  };
  adminNotes?: string;
  createdAt: string;
  accessToken?: string;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  }[];
  orders?: Order[];
};
export type Coupon = {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minCartValue: number;
  maxDiscountCap: number | null;
  usageLimit: number | null;
  timesUsed: number;
  expiryDate: string;
  isActive: boolean;
};
export type Catalog = {
  products: Product[];
  facets: { categories: string[]; fabrics: string[]; crafts: string[] };
  pagination: { page: number; total: number; hasMore: boolean };
};
