process.env.RESEND_API_KEY = "";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryReplSet } from "mongodb-memory-server";
process.env.JWT_SECRET = "test-only-secret-key-at-least-32-characters";
let repl,
  server,
  base,
  Product,
  Collection,
  Order,
  Coupon,
  Settings,
  adminToken,
  product;
async function request(path, body, options = {}) {
  const res = await fetch(base + "/api" + path, {
    method: body === undefined ? "GET" : "POST",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: res.status, data: await res.json() };
}
const auth = () => ({ Authorization: `Bearer ${adminToken}` });
const customer = {
  name: "Test Customer",
  email: "buyer@example.com",
  phone: "9876543210",
  shippingAddress: {
    addressLine1: "1 Test Street",
    city: "Surat",
    state: "Gujarat",
    pincode: "395001",
  },
};
const payload = () => ({
  customer,
  items: [{ productId: String(product._id), variantSize: "M", quantity: 1 }],
  financials: { discountAmount: 999999, totalAmount: 0 },
  paymentMethod: "card",
});
let sequence = 0;
const key = () => `test-order-unique-idempotency-key-${++sequence}`;
before(async () => {
  repl = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.14" },
  });
  process.env.MONGO_URI = repl.getUri();
  const { default: app } = await import("../src/app.js");
  ({ Product } = await import("../src/modules/products/product.model.js"));
  ({ Collection } =
    await import("../src/modules/collections/collection.model.js"));
  ({ Order } = await import("../src/modules/orders/order.model.js"));
  ({ Coupon } = await import("../src/modules/coupons/coupon.model.js"));
  ({ Settings } = await import("../src/modules/settings/settings.model.js"));
  const { AdminUser } = await import("../src/modules/auth/admin.model.js");
  await mongoose.connect(repl.getUri());
  await Promise.all([
    Product.init(),
    Order.init(),
    Coupon.init(),
    Settings.init(),
    AdminUser.init(),
    Collection.init(),
  ]);
  await AdminUser.create({
    name: "Test Admin",
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("test-password-123", 4),
    role: "superadmin",
  });
  await Settings.create({
    key: "store",
    serviceablePrefixes: ["395"],
    shippingFee: 500,
    freeShippingThreshold: 15000,
  });
  await Collection.create({
    collectionId: "flora",
    name: "Flora",
    mood: "Botanical",
  });
  product = await Product.create({
    title: "Test jacket",
    slug: "test-jacket",
    collectionId: "flora",
    category: "Jacket",
    description: "Test jacket description",
    price: 1000,
    images: [
      { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
    ],
    variants: [{ size: "M", sku: "TEST-M", stock: 30, priceDelta: 200 }],
    isPublished: true,
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const login = await request("/admin/login", {
    email: "admin@example.com",
    password: "test-password-123",
  });
  adminToken = login.data.data.token;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (repl) await repl.stop();
});
test("protected merchant endpoints reject guests and forged roles", async () => {
  assert.equal((await request("/admin/products")).status, 401);
  const jwt = await import("jsonwebtoken");
  const fake = jwt.default.sign(
    { id: product._id, role: "superadmin" },
    process.env.JWT_SECRET,
  );
  assert.equal(
    (
      await request("/admin/products", undefined, {
        headers: { Authorization: `Bearer ${fake}` },
      })
    ).status,
    401,
  );
});
test("catalog hides drafts in lists and direct URLs, escapes search, supports facets", async () => {
  const draft = await Product.create({
    title: "Private draft",
    slug: "private-draft",
    collectionId: "flora",
    category: "Jacket",
    description: "Private",
    price: 10,
    isPublished: false,
    variants: [{ size: "M", sku: "DRAFT-M", stock: 0 }],
  });
  assert.equal((await request(`/products/${draft._id}`)).status, 404);
  assert.equal((await request("/products/private-draft")).status, 404);
  const list = await request("/products?search=%5B&limit=99999");
  assert.equal(list.status, 200);
  assert.equal(list.data.data.products.length, 0);
  assert.equal(list.data.data.pagination.limit, 100);
});
test("quote rejects forged products, negative quantities and excess combined stock", async () => {
  for (const items of [
    [{ productId: "000000000000000000000000", variantSize: "M", quantity: 1 }],
    [{ productId: String(product._id), variantSize: "M", quantity: -1 }],
    [
      { productId: String(product._id), variantSize: "M", quantity: 20 },
      { productId: String(product._id), variantSize: "M", quantity: 20 },
    ],
  ])
    assert.ok((await request("/cart/quote", { items })).status >= 400);
});
test("PIN checks respect configured serviceability and invalid addresses fail", async () => {
  assert.equal((await request("/delivery/395001")).data.data.serviceable, true);
  assert.equal(
    (await request("/delivery/110001")).data.data.serviceable,
    false,
  );
  assert.equal((await request("/delivery/abc123")).status, 400);
  const p = payload();
  p.customer = { ...customer, shippingAddress: {} };
  assert.equal(
    (await request("/orders", p, { headers: { "Idempotency-Key": key() } }))
      .status,
    400,
  );
});
test("order recalculates prices, ignores forged discounts, reserves stock and remains unpaid", async () => {
  const before = await Product.findById(product._id);
  const result = await request("/orders", payload(), {
    headers: { "Idempotency-Key": key() },
  });
  assert.equal(result.status, 201);
  const o = result.data.data;
  assert.equal(o.financials.subtotal, 1200);
  assert.equal(o.financials.discountAmount, 0);
  assert.equal(o.financials.totalAmount, 1700);
  assert.equal(o.payment.status, "pending");
  assert.equal(o.payment.gateway, "none");
  assert.equal(o.fulfillment.trackingNumber, "");
  assert.equal(
    (await Product.findById(product._id)).variants[0].stock,
    before.variants[0].stock - 1,
  );
  assert.equal((await request(`/orders/${o.orderNumber}`)).status, 404);
  assert.equal(
    (
      await request(`/orders/${o.orderNumber}`, undefined, {
        headers: { "X-Order-Token": o.accessToken },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/orders/track", {
        orderNumber: o.orderNumber,
        contact: customer.email,
      })
    ).status,
    404,
  );
  const pdf = await fetch(
    `${base}/api/orders/${o.orderNumber}/acknowledgement`,
    { headers: { "X-Order-Token": o.accessToken } },
  );
  assert.equal(pdf.headers.get("content-type"), "application/pdf");
  assert.ok((await pdf.arrayBuffer()).byteLength > 1000);
});
test("idempotency retry creates one order and changed payload cannot reuse the key", async () => {
  const k = key(),
    before = await Product.findById(product._id),
    body = payload();
  const one = await request("/orders", body, {
      headers: { "Idempotency-Key": k },
    }),
    two = await request("/orders", body, { headers: { "Idempotency-Key": k } });
  assert.equal(one.data.data.orderNumber, two.data.data.orderNumber);
  assert.equal(await Order.countDocuments({ idempotencyKey: k }), 1);
  assert.equal(
    (await Product.findById(product._id)).variants[0].stock,
    before.variants[0].stock - 1,
  );
  body.items[0].quantity = 2;
  assert.equal(
    (await request("/orders", body, { headers: { "Idempotency-Key": k } }))
      .status,
    409,
  );
});
test("coupon redemption obeys its cap and exhaustion; cancellation restores inventory once", async () => {
  await Coupon.create({
    code: "TEST10",
    discountType: "percentage",
    discountValue: 10,
    expiryDate: new Date(Date.now() + 86400000),
    usageLimit: 1,
  });
  const body = { ...payload(), couponCode: "TEST10" },
    before = await Product.findById(product._id),
    result = await request("/orders", body, {
      headers: { "Idempotency-Key": key() },
    });
  assert.equal(result.status, 201);
  assert.equal(result.data.data.financials.discountAmount, 120);
  assert.equal((await request("/cart/quote", body)).status, 400);
  const o = await Order.findOne({ orderNumber: result.data.data.orderNumber });
  const update = {
    status: "cancelled",
    courierPartner: "",
    trackingNumber: "",
    adminNotes: "test",
  };
  assert.equal(
    (
      await request(`/admin/orders/${o._id}`, update, {
        method: "PUT",
        headers: auth(),
      })
    ).status,
    200,
  );
  await request(`/admin/orders/${o._id}`, update, {
    method: "PUT",
    headers: auth(),
  });
  assert.equal(
    (await Product.findById(product._id)).variants[0].stock,
    before.variants[0].stock,
  );
  assert.equal((await Coupon.findOne({ code: "TEST10" })).timesUsed, 0);
  assert.equal(
    (
      await request(
        `/admin/orders/${o._id}`,
        { ...update, status: "received" },
        { method: "PUT", headers: auth() },
      )
    ).status,
    409,
  );
});
test("concurrent orders cannot oversell last stock", async () => {
  const p = await Product.create({
    title: "Last piece",
    slug: "last-piece",
    collectionId: "flora",
    category: "Jacket",
    description: "Last",
    price: 100,
    variants: [{ size: "M", sku: "LAST", stock: 1 }],
  });
  const body = {
    customer,
    items: [{ productId: String(p._id), variantSize: "M", quantity: 1 }],
  };
  const results = await Promise.all([
    request("/orders", body, { headers: { "Idempotency-Key": key() } }),
    request("/orders", body, { headers: { "Idempotency-Key": key() } }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal((await Product.findById(p._id)).variants[0].stock, 0);
});
test("admin CRUD validates fields and rejects stale inventory edits", async () => {
  assert.equal(
    (await request("/admin/products", { title: "Bad" }, { headers: auth() }))
      .status,
    400,
  );
  const p = (await Product.findById(product._id)).toObject();
  const edited = await request(
    `/admin/products/${p._id}`,
    { ...p, description: "Updated description" },
    { method: "PUT", headers: auth() },
  );
  assert.equal(edited.status, 200);
  assert.equal(
    (
      await request(`/admin/products/${p._id}`, p, {
        method: "PUT",
        headers: auth(),
      })
    ).status,
    409,
  );
  const s = await request(
    "/admin/settings",
    { heroTitle: "New campaign", serviceablePrefixes: ["395"] },
    { method: "PUT", headers: auth() },
  );
  assert.equal(s.status, 200);
  assert.equal(
    (await request("/settings")).data.data.heroTitle,
    "New campaign",
  );
  assert.equal(
    (
      await request(
        "/admin/settings",
        { logo: "javascript:alert(1)" },
        { method: "PUT", headers: auth() },
      )
    ).status,
    400,
  );
});
test("customer auth never promotes a customer into merchant role", async () => {
  const r = await request("/auth/register", {
    name: "Customer",
    email: "member@example.com",
    password: "safe-test-pass-123",
    role: "superadmin",
  });
  assert.equal(r.status, 201);
  const headers = { Authorization: `Bearer ${r.data.data.token}` };
  assert.equal((await request("/auth/me", undefined, { headers })).status, 200);
  assert.equal(
    (await request("/admin/products", undefined, { headers })).status,
    403,
  );
});

test("made-to-order custom requests validate measurements and do not consume ready stock", async () => {
  const p = await Product.create({
    title: "Custom piece",
    slug: "custom-piece",
    collectionId: "flora",
    category: "Jacket",
    description: "Made to order",
    price: 15000,
    madeToOrder: true,
    variants: [{ size: "Custom", sku: "CUSTOM-ONLY", stock: 0, priceDelta: 0 }],
  });
  const item = {
    productId: String(p._id),
    variantSize: "Custom",
    quantity: 1,
    customMeasurements: { waist: "invalid" },
  };
  assert.equal((await request("/cart/quote", { items: [item] })).status, 400);
  item.customMeasurements = { waist: "30" };
  const result = await request(
    "/orders",
    { customer, items: [item] },
    { headers: { "Idempotency-Key": key() } },
  );
  assert.equal(result.status, 201);
  assert.equal(result.data.data.financials.shippingFee, 0);
  const order = await Order.findOne({
    orderNumber: result.data.data.orderNumber,
  });
  assert.equal(order.items[0].madeToOrder, true);
  await request(
    `/admin/orders/${order._id}`,
    { status: "cancelled", courierPartner: "", trackingNumber: "" },
    { method: "PUT", headers: auth() },
  );
  assert.equal((await Product.findById(p._id)).variants[0].stock, 0);
});
test("merchant rejects unsafe navigation and excessive variant prices", async () => {
  assert.equal(
    (
      await request(
        "/admin/settings",
        { navigation: [{ label: "Unsafe", href: "/\\example.com" }] },
        { method: "PUT", headers: auth() },
      )
    ).status,
    400,
  );
  const p = (await Product.findById(product._id)).toObject();
  p.variants[0].priceDelta = 1e100;
  assert.equal(
    (
      await request(`/admin/products/${p._id}`, p, {
        method: "PUT",
        headers: auth(),
      })
    ).status,
    400,
  );
  assert.equal((await request("/cart/quote", { items: [null] })).status, 400);
});

test("one-click availability pause blocks checkout without destroying inventory", async () => {
  const before = await Product.findById(product._id);
  assert.equal(
    (
      await request(
        `/admin/products/${product._id}/availability`,
        { salesPaused: true },
        { method: "PATCH", headers: auth() },
      )
    ).status,
    200,
  );
  assert.equal((await request("/cart/quote", payload())).status, 409);
  assert.equal(
    (await Product.findById(product._id)).totalStock,
    before.totalStock,
  );
  assert.equal(
    (
      await request(
        `/admin/products/${product._id}/availability`,
        { salesPaused: false },
        { method: "PATCH", headers: auth() },
      )
    ).status,
    200,
  );
  assert.equal((await request("/cart/quote", payload())).status, 200);
});

test('Vite customer profile persists wishlist/addresses and owns private orders', async()=>{
 const email='vite-account@example.com';
 const registered=await request('/auth/register',{name:'Vite Buyer',email,password:'test-password-long-enough',phone:'9876543210'});
 assert.equal(registered.status,201);const token=registered.data.data.token;const headers={Authorization:`Bearer ${token}`};
 const saved=await request('/auth/profile',{wishlist:['review-product'],addresses:[customer.shippingAddress]},{method:'PUT',headers});assert.equal(saved.status,200);assert.deepEqual(saved.data.data.wishlist,['review-product']);
 const invalid=await request('/auth/profile',{addresses:[{city:'x'}]},{method:'PUT',headers});assert.equal(invalid.status,400);
 const me=await request('/auth/me',undefined,{headers});assert.equal(me.data.data.addresses.length,1);
 const order=await Order.create({orderNumber:'RV-VITE-PRIVATE',customerId:registered.data.data.customer.id,customer:{...customer,email},items:[],financials:{subtotal:0,totalAmount:0},idempotencyKey:'vite-private-order-unique-key-123456',requestHash:'test',accessTokenHash:'a'.repeat(64)});
 const own=await request(`/orders/${order.orderNumber}`,undefined,{headers});assert.equal(own.status,200);assert.equal(own.data.data.idempotencyKey,undefined);
 const guest=await request(`/orders/${order.orderNumber}`);assert.equal(guest.status,404);
 const other=await request('/auth/register',{name:'Other',email:'other-vite@example.com',password:'test-password-long-enough'});
 const denied=await request(`/orders/${order.orderNumber}`,undefined,{headers:{Authorization:`Bearer ${other.data.data.token}`}});assert.equal(denied.status,404);
 const changed=await request('/auth/password/change',{currentPassword:'test-password-long-enough',password:'new-long-password-123'},{headers});assert.equal(changed.status,200);
 assert.equal((await request('/auth/login',{email,password:'test-password-long-enough'})).status,401);
 assert.equal((await request('/auth/login',{email,password:'new-long-password-123'})).status,200);
 assert.equal((await request('/auth/password/reset',{token:'a'.repeat(64),password:'new-long-password-123'})).status,400);
 assert.equal((await request('/auth/email/verify',{token:'a'.repeat(64)})).status,400);
});

test('password reset and email verification tokens expire and are single-use',async()=>{
 const {Customer}=await import('../src/modules/auth/customer.model.js');const {createHash}=await import('node:crypto');const digest=t=>createHash('sha256').update(t).digest('hex');const token='b'.repeat(64);
 const registered=await request('/auth/register',{name:'Reset Buyer',email:'reset-vite@example.com',password:'original-password-123'});const id=registered.data.data.customer.id;const oldToken=registered.data.data.token;
 await Customer.updateOne({_id:id},{$set:{resetHash:digest(token),resetExpires:new Date(Date.now()+60000),verificationHash:digest(token),verificationExpires:new Date(Date.now()+60000)}});
 assert.equal((await request('/auth/email/verify',{token})).status,200);assert.equal((await request('/auth/email/verify',{token})).status,400);
 assert.equal((await request('/auth/password/reset',{token,password:'replacement-password-123'})).status,200);assert.equal((await request('/auth/password/reset',{token,password:'replacement-password-123'})).status,400);
 assert.equal((await request('/auth/me',undefined,{headers:{Authorization:`Bearer ${oldToken}`}})).status,401);
 await Customer.updateOne({_id:id},{$set:{resetHash:digest(token),resetExpires:new Date(Date.now()-1000)}});
 assert.equal((await request('/auth/password/reset',{token,password:'replacement-password-123'})).status,400);
});
