import { useState, useEffect } from 'react';
import { Package, Heart, MapPin, LogOut, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../context/store.js';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';

export default function AccountPage({ initialTab = 'orders', navigate }) {
  const { customer, login, register, logout, wishlist, addToast, setCustomer } = useStore();
  const customerKey = customer ? customer._id || customer.id || customer.email || 'session' : null;

  const [activeTab, setActiveTab] = useState(customer ? initialTab : 'login');
  const [orders, setOrders] = useState([]);
  const [ordersLoadedFor, setOrdersLoadedFor] = useState(null);
  const ordersLoading = Boolean(customerKey) && ordersLoadedFor !== customerKey;
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const visibleWishlistProducts = wishlist.length > 0 ? wishlistProducts : [];

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');

  // Fetch orders & wishlist products when customer is logged in. Loading state is
  // derived, so the effects only ever call setState from async callbacks.
  useEffect(() => {
    if (!customerKey) return;
    let active = true;
    api
      .me()
      .then((res) => {
        if (!active) return;
        if (res.success && res.data && res.data.orders) setOrders(res.data.orders);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setOrdersLoadedFor(customerKey);
      });
    return () => {
      active = false;
    };
  }, [customerKey]);

  useEffect(() => {
    if (!wishlist.length) return;
    let active = true;
    Promise.all(wishlist.map((id) => api.getProductByIdOrSlug(id))).then((prods) => {
      if (active) setWishlistProducts(prods.filter(Boolean));
    });
    return () => {
      active = false;
    };
  }, [wishlist]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      setActiveTab('orders');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    const res = await register(regName, regEmail, regPassword, regPhone);
    setRegLoading(false);
    if (res.success) {
      setActiveTab('orders');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !pincode) return;

    const currentAddresses = customer?.addresses || [];
    const newAddr = {
      addressLine1,
      city,
      state,
      pincode,
      country: 'India',
      isDefault: currentAddresses.length === 0,
    };

    const updated = [...currentAddresses, newAddr];
    const res = await api.updateProfile({ addresses: updated });
    if (res.success) {
      setCustomer((c) => ({ ...c, addresses: res.data?.addresses || updated }));
      setShowAddressForm(false);
      setAddressLine1('');
      setCity('');
      setPincode('');
      addToast('Address added to your profile', 'success');
    } else {
      addToast(res.message || 'Could not save address', 'error');
    }
  };

  const handleDeleteAddress = async (idx) => {
    const updated = (customer?.addresses || []).filter((_, i) => i !== idx);
    const res = await api.updateProfile({ addresses: updated });
    if (res.success) {
      setCustomer((c) => ({ ...c, addresses: updated }));
      addToast('Address removed', 'info');
    }
  };

  // Signed Out View
  if (!customer) {
    return (
      <main className="rv-container account-auth py-16 md:py-24 min-h-[70vh]">
        <div className="w-full max-w-md bg-[var(--color-paper)]">
          <div className="text-center mb-6">
            <h1>{activeTab === 'login' ? 'Welcome back.' : 'Make yourself at home.'}</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1.5 font-body">
              {activeTab === 'login' ? 'Your favourite pieces and orders, all in one place.' : 'Create an account to save your favourites and follow your orders.'}
            </p>

            {/* Tab Switcher */}
            <div className="flex border-b border-[var(--color-line)] mt-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 ${
                  activeTab === 'login'
                    ? 'border-[var(--color-clay)] text-[var(--color-clay)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 ${
                  activeTab === 'register'
                    ? 'border-[var(--color-clay)] text-[var(--color-clay)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1 transition-colors"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full h-11 justify-center mt-2"
              >
                {loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
            <a href="/?page=security" className="block text-sm underline underline-offset-4 mt-4">Forgot your password?</a></form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Radhika Sharma"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-base"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1.5">
                  Password (12–72 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 12 characters"
                    minLength={12}
                    maxLength={72}
                    className="input-base pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1 transition-colors"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn-primary w-full h-11 justify-center mt-2"
              >
                {regLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // Signed In Customer Dashboard (§12.11)
  return (
    <main className="rv-container py-12 md:py-16 min-h-[75vh]">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[var(--color-line)] gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-clay)]">
            Patron Account
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-ink)] font-normal mt-1">
            Namaste, {customer.name}
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">{customer.email}</p>
        </div>

        <button
          onClick={logout}
          className="btn-secondary btn-sm self-start md:self-auto flex items-center gap-1.5 text-[var(--color-error)] border-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-white)]"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--color-line)] my-8 overflow-x-auto gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'orders'
              ? 'border-[var(--color-clay)] text-[var(--color-clay)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Package size={16} />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'wishlist'
              ? 'border-[var(--color-clay)] text-[var(--color-clay)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Heart size={16} />
          <span>Saved Pieces ({wishlist.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'addresses'
              ? 'border-[var(--color-clay)] text-[var(--color-clay)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <MapPin size={16} />
          <span>Addresses ({(customer.addresses || []).length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {ordersLoading ? (
            <div className="py-16 text-center text-sm text-[var(--color-muted)]">
              Loading your atelier orders…
            </div>
          ) : orders.length > 0 ? (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
                  <div>
                    <span className="text-xs text-[var(--color-muted)]">Order Number</span>
                    <p className="font-semibold text-sm text-[var(--color-ink)]">{ord.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-muted)]">Date</span>
                    <p className="text-xs text-[var(--color-ink)]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-muted)]">Total Amount</span>
                    <p className="price-tabular font-semibold text-sm text-[var(--color-ink)]">
                      ₹{ord.financials?.totalAmount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-muted)]">Fulfillment Status</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider bg-[var(--color-cream)] text-[var(--color-clay)]">
                      {ord.fulfillment?.status || 'Received'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[var(--color-line)]">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/images/hero-home.jpg'}
                          alt={item.productTitle}
                          className="w-12 h-16 object-cover rounded-[4px] bg-[var(--color-sand)]"
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-ink)]">{item.productTitle}</p>
                          <p className="text-xs text-[var(--color-muted)]">
                            Size: {item.variantSize} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="price-tabular text-sm font-semibold text-[var(--color-ink)]">
                        ₹{item.subtotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[var(--color-cream)]/40 border border-[var(--color-line)] rounded-[8px]">
              <Package size={32} className="mx-auto text-[var(--color-muted)] mb-3" />
              <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal">No orders placed yet</h3>
              <p className="text-xs text-[var(--color-muted)] mt-1 mb-6">
                When you acquire pieces from our collections, their stitching and delivery progress will appear here.
              </p>
              <button onClick={() => navigate({ page: 'shop' })} className="btn-primary btn-sm">
                Explore Pieces
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {visibleWishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleWishlistProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onSelect={(slug) => navigate({ page: 'product', id: slug })}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-[var(--color-cream)]/40 border border-[var(--color-line)] rounded-[8px]">
              <Heart size={32} className="mx-auto text-[var(--color-muted)] mb-3" />
              <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal">Your wishlist is empty</h3>
              <p className="text-xs text-[var(--color-muted)] mt-1 mb-6">
                Tap the heart on any piece in our collections to save it for your private collection.
              </p>
              <button onClick={() => navigate({ page: 'shop' })} className="btn-primary btn-sm">
                Browse Collection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              Delivery Addresses
            </h3>
            {!showAddressForm && (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add New Address</span>
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-6 bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] space-y-4 max-w-lg">
              <h4 className="font-display text-xl text-[var(--color-ink)] font-normal">New Delivery Address</h4>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat / House No., Street, Area"
                  className="input-base"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Surat"
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="395007"
                    className="input-base"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-base"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary btn-sm flex-1">
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(customer.addresses || []).map((addr, idx) => (
              <div
                key={idx}
                className="p-5 bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] flex justify-between items-start"
              >
                <div className="space-y-1 text-sm">
                  {addr.isDefault && (
                    <span className="inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[var(--color-cream)] text-[var(--color-clay)] mb-1">
                      Default Address
                    </span>
                  )}
                  <p className="font-semibold text-[var(--color-ink)]">{addr.addressLine1}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{addr.country || 'India'}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(idx)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-error)] p-1 transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
