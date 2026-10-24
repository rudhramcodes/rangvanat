import { useState, useEffect } from 'react';
import { Package, Heart, MapPin, User, LogOut, Plus } from 'lucide-react';
import { useStore } from '../context/store.js';
import ProductCard from '../components/ProductCard.jsx';
import { api, fetchJson } from '../api/client.js';

export default function AccountPage({ initialTab = 'orders', navigate }) {
  const { customer, login, register, logout, wishlist, formatPrice, addToast, setCustomer, refreshCustomer } = useStore();

  const [savedProducts,setSavedProducts]=useState([]);
  useEffect(()=>{let active=true;Promise.all(wishlist.map(id=>api.getProductByIdOrSlug(id))).then(rows=>{if(active)setSavedProducts(rows.filter(Boolean));});return()=>{active=false;};},[wishlist]);
  const [profileError,setProfileError]=useState('');
  const saveProfile=async values=>{const r=await api.updateProfile(values);if(r.success){setCustomer(c=>({...c,...r.data}));await refreshCustomer();return true;}setProfileError(r.message);return false;};
  const [activeTab, setActiveTab] = useState(customer ? initialTab : 'login');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // New Address Form
  const [editingAddress,setEditingAddress]=useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState,setNewState] = useState('Gujarat');
  const [newPincode, setNewPincode] = useState('');

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
    if (!newStreet || !newCity || !newPincode) return;

    const currentAddresses = customer?.addresses || [];
    const candidate = {addressLine1:newStreet,city:newCity,state:newState,pincode:newPincode,country:'India',isDefault:currentAddresses.length===0};
    const updated = editingAddress===null ? [
      ...currentAddresses,
      {
        addressLine1: newStreet,
        city: newCity,
        state: newState,
        pincode: newPincode,
        country: 'India',
        isDefault: currentAddresses.length === 0,
      },
    ] : currentAddresses.map((a,i)=>i===editingAddress?{...a,...candidate,isDefault:a.isDefault}:a);

    if (await saveProfile({addresses:updated})) {
      addToast('Address added to profile', 'success');
      setShowAddressModal(false);
      setNewStreet('');
      setNewCity('');
      setNewPincode('');setEditingAddress(null);
    }
  };

  // Signed out state: Sign In / Register Card (§12.11)
  if (!customer) {
    return (
      <main id="main-content" className="rv-container py-16 md:py-24 flex justify-center">
        <div className="w-full max-w-[440px] bg-white border border-[var(--line-khadi)] p-8 rounded-[2px] shadow-sm">
          <div className="text-center mb-8">
            <span className="font-display text-2xl font-semibold tracking-wider text-[var(--brand-maroon)]">
              RANGVANAT
            </span>
            <p className="serif-statement text-lg text-[var(--ink-chocolate)] mt-2">
              {activeTab === 'login' ? 'Welcome back to the atelier.' : 'Join the custodians of Khadi.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate({ page: 'security' })}
            className="btn-ghost text-xs text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] block my-3 text-left"
          >
            Forgot password?
          </button>
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="accountpage-field-1" className="form-label">Email Address</label>
                <input id="accountpage-field-1"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="accountpage-field-2" className="form-label">Password</label>
                <input id="accountpage-field-2"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-primary btn-md w-full justify-center uppercase tracking-wider text-sm mt-2"
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="text-center pt-4 border-t border-[var(--line-khadi)]">
                <span className="caption text-[var(--ink-soft)]">New to Rangvanat? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="btn-ghost text-xs text-[var(--brand-maroon)] font-semibold"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="accountpage-field-3" className="form-label">Full Name</label>
                <input id="accountpage-field-3"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Radhika Sharma"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="accountpage-field-4" className="form-label">Email Address</label>
                <input id="accountpage-field-4"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="accountpage-field-5" className="form-label">Phone Number</label>
                <input id="accountpage-field-5"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="accountpage-field-6" className="form-label">Create Password</label>
                <input id="accountpage-field-6"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="12–72 characters" minLength={12} maxLength={72}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn btn-primary btn-md w-full justify-center uppercase tracking-wider text-sm mt-2"
              >
                {regLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center pt-4 border-t border-[var(--line-khadi)]">
                <span className="caption text-[var(--ink-soft)]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="btn-ghost text-xs text-[var(--brand-maroon)] font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  // Signed In Customer Dashboard (§12.11)
  return (
    <main id="main-content" className="rv-container py-12 md:py-16">
      {/* Breadcrumbs */}
      <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
        <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
          Home
        </button>
        <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
        <span className="text-[var(--brand-maroon)] font-semibold">Account Dashboard</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-baseline justify-between pb-6 border-b border-[var(--line-khadi)] mb-10 gap-2">
        <div>
          <span className="caption uppercase font-semibold text-[var(--brand-gold)]">Customer Atelier</span>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl">
            Namaste, {customer.name}
          </h1>
        </div>
        <button
          onClick={logout}
          className="btn-ghost text-xs text-[var(--state-error)] flex items-center gap-1.5 self-start"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Nav Rows (3 Cols) */}
        <aside className="lg:col-span-3 space-y-1 bg-white p-3 border border-[var(--line-khadi)] rounded-[2px] self-start shadow-sm">
          {[
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'wishlist', label: 'My Wishlist', icon: Heart },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-11 px-4 rounded-[2px] flex items-center gap-3 text-sm font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-[var(--brand-maroon)] text-[var(--bg-ivory)]'
                    : 'text-[var(--ink-chocolate)] hover:bg-[var(--bg-cream)]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Right (9 Cols) */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 border border-[var(--line-khadi)] rounded-[2px] shadow-sm">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg pb-3 border-b border-[var(--line-khadi)]">
                Order History
              </h2>

              {!customer.orders || customer.orders.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="serif-statement text-xl text-[var(--ink-chocolate)] mb-3">
                    "No orders placed yet."
                  </p>
                  <p className="body-s text-[var(--ink-soft)] mb-6">
                    Our current seasonal lookbook is ready for your perusal.
                  </p>
                  <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-md">
                    Shop Lookbook
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-5 border border-[var(--line-khadi)] rounded-[2px] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--line-khadi)] gap-2">
                        <div>
                          <span className="font-semibold text-sm text-[var(--brand-maroon)]">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-[var(--ink-soft)] block">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`badge-pill static ${
                              ord.fulfillment?.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[var(--brand-maroon-tint)] text-[var(--brand-maroon)]'
                            }`}
                          >
                            {ord.fulfillment?.status?.toUpperCase() || 'RECEIVED'}
                          </span>
                          <button
                            onClick={() => navigate({ page: 'track', orderNumber: ord.orderNumber })}
                            className="btn btn-secondary btn-sm text-xs"
                          >
                            Track Shipment →
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {ord.items?.map((it, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              {it.productTitle} · Size: {it.variantSize} (x{it.quantity})
                            </span>
                            <span className="font-semibold">{formatPrice(it.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[var(--line-khadi)]/50 flex justify-between font-bold text-sm">
                        <span>Order total · payment pending</span>
                        <span className="price">{formatPrice(ord.financials?.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg pb-3 border-b border-[var(--line-khadi)]">
                My Saved Pieces ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="serif-statement text-xl text-[var(--ink-chocolate)] mb-3">
                    "Your wishlist is waiting for inspiration."
                  </p>
                  <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-md mt-2">
                    Explore Lookbook
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {savedProducts.map(p=><ProductCard key={p._id} product={p} onSelect={id=>navigate({page:'product',id})} />)}

                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line-khadi)]">
                <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg">
                  Saved Delivery Addresses
                </h2>
                <button onClick={() => {setEditingAddress(null);setNewStreet('');setNewCity('');setNewState('');setNewPincode('');setShowAddressModal(true);}} className="btn btn-primary btn-sm">
                  + Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses?.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-5 border border-[var(--line-khadi)] rounded-[2px] space-y-2 relative"
                  >
                    {addr.isDefault && (
                      <span className="caption uppercase font-semibold text-[var(--brand-gold)] text-xs">
                        Default Address
                      </span>
                    )}
                    <p className="text-sm font-semibold text-[var(--ink-chocolate)]">
                      {customer.name}
                    </p>
                    <p className="body-s text-xs leading-relaxed text-[var(--ink-soft)]">
                      {addr.addressLine1}, {addr.addressLine2 ? addr.addressLine2 + ', ' : ''}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="caption text-xs">{addr.country}</p><button className="btn btn-secondary btn-sm" onClick={()=>{setEditingAddress(idx);setNewStreet(addr.addressLine1);setNewCity(addr.city);setNewState(addr.state);setNewPincode(addr.pincode);setShowAddressModal(true);}}>Edit address</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>saveProfile({addresses:customer.addresses.filter((_,i)=>i!==idx)})}>Delete address</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>saveProfile({addresses:customer.addresses.map((a,i)=>({...a,isDefault:i===idx}))})}>Make default</button>
                  </div>
                ))}

                {/* Dashed "+ Add Address" Card (§12.11) */}
                <button
                  type="button"
                  onClick={() => {setEditingAddress(null);setNewStreet('');setNewCity('');setNewState('');setNewPincode('');setShowAddressModal(true);}}
                  className="min-h-[140px] border-2 border-dashed border-[var(--line-khadi)] hover:border-[var(--brand-maroon)] rounded-[2px] flex flex-col items-center justify-center p-6 text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] transition-colors"
                >
                  <Plus size={22} className="mb-1" />
                  <span className="text-sm font-semibold">Add New Address</span>
                </button>
              </div>

              {/* Add Address Modal Form */}
              {showAddressModal && (
                <div className="fixed inset-0 z-80 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 max-w-md w-full rounded-[2px] shadow-xl space-y-4">
                    <h3 className="heading-3 text-[var(--brand-maroon)] uppercase">New Delivery Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div>
                        <label htmlFor="accountpage-field-7" className="form-label">Address Line 1</label>
                        <input id="accountpage-field-7"
                          type="text"
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="Building, street, flat"
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="accountpage-field-8" className="form-label">City</label>
                          <input id="accountpage-field-8"
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="City"
                            className="form-input"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="accountpage-field-9" className="form-label">PIN Code</label>
                          <input id="accountpage-field-9"
                            type="text"
                            value={newPincode}
                            onChange={(e) => setNewPincode(e.target.value)}
                            placeholder="Six-digit PIN" pattern="[1-9][0-9]{5}"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      <label className="block">State / union territory<input className="form-input" required value={newState} onChange={e=>setNewState(e.target.value)} placeholder="State / union territory" /></label>
                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm">
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {profileError&&<p role="alert">{profileError}</p>}
          {activeTab === 'profile' && <form className="space-y-4" onSubmit={async e=>{e.preventDefault();const data=new FormData(e.currentTarget);if(await saveProfile(Object.fromEntries(data)))addToast('Profile updated','success');}}>
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line-khadi)]">
              <h2 className="heading-3">Profile settings</h2>
              <button
                type="button"
                onClick={() => navigate({ page: 'security' })}
                className="btn-ghost text-xs text-[var(--brand-maroon)]"
              >
                Change password
              </button>
            </div>
            <p className="text-xs text-[var(--ink-soft)]">Email {customer.emailVerified ? 'verified ✓' : 'not verified'}</p>
            {!customer.emailVerified && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  const r = await fetchJson('/auth/email/request', { method: 'POST', body: '{}' });
                  addToast(r.success ? r.data.message : r.message, r.success ? 'success' : 'error');
                }}
              >
                Send verification email
              </button>
            )}
            <label className="block">Name<input className="form-input" name="name" defaultValue={customer.name} required placeholder="Full name" /></label>
            <label className="block">Email<input className="form-input" value={customer.email} readOnly /></label>
            <label className="block">Phone<input className="form-input" name="phone" defaultValue={customer.phone} placeholder="Mobile phone" /></label>
            <button className="btn btn-primary">Save profile</button>
          </form>}
        </div></div></main>);
}
