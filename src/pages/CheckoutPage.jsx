import { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useStore } from '../context/store';
import { cartItems, checkoutKey } from '../lib/commerce';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

export default function CheckoutPage({ navigate, onOrderComplete }) {
  const { cart, customer, clearCart, formatPrice, addToast, couponCode, refreshCustomer } = useStore();

  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [details, setDetails] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    addressLine1: customer?.addresses?.[0]?.addressLine1 || '',
    addressLine2: customer?.addresses?.[0]?.addressLine2 || '',
    city: customer?.addresses?.[0]?.city || '',
    state: customer?.addresses?.[0]?.state || 'Gujarat',
    pincode: customer?.addresses?.[0]?.pincode || '',
  });

  const change = (key, value) => {
    setDetails((d) => ({ ...d, [key]: value }));
    setQuote(null);
    setError('');
  };

  // Auto-fetch quote when pincode has 6 digits
  useEffect(() => {
    if (details.pincode && details.pincode.length === 6 && cart.length > 0) {
      const items = cartItems(cart);
      api.quote(items, couponCode, details.pincode).then((result) => {
        if (result?.success) {
          setQuote(result.data);
        }
      }).catch(() => {});
    }
  }, [details.pincode, cart, couponCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const items = cartItems(cart);
      // 1. Validate quote
      const result = await api.quote(items, couponCode, details.pincode);
      if (!result.success) throw new Error(result.message || 'Unable to quote delivery');

      if (!quote || JSON.stringify(quote.financials) !== JSON.stringify(result.data.financials)) {
        setQuote(result.data);
        setBusy(false);
        return;
      }

      // 2. Submit order request
      const { name, email, phone, ...shippingAddress } = details;
      const payload = {
        customer: { name, email, phone, shippingAddress },
        items,
        couponCode,
      };

      const res = await api.createOrder(payload, checkoutKey(payload));
      if (!res.success) throw new Error(res.message || 'Failed to submit order request');

      sessionStorage.setItem(`rv_order_${res.data.orderNumber}`, res.data.accessToken);
      clearCart();
      await refreshCustomer?.();
      addToast('Order request received by the atelier.', 'success');
      onOrderComplete(res.data);
    } catch (err) {
      setError(err.message || 'Failed to submit order');
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <main className="rv-container py-24 text-center">
        <p className="serif-statement text-2xl text-[var(--ink-chocolate)] mb-3">
          "Your bag is empty, but the looms are weaving."
        </p>
        <p className="body-l text-[var(--ink-soft)] mb-8">
          Browse our atelier collections to select your handcrafted pieces.
        </p>
        <button
          onClick={() => navigate({ page: 'shop' })}
          className="btn btn-primary btn-lg"
        >
          Browse Lookbook
        </button>
      </main>
    );
  }

  const subtotalEstimate = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-10 md:py-16">
      <div className="rv-container max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ page: 'cart' })}
            className="btn-ghost text-xs text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Shopping Bag</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="pb-8 mb-10 border-b border-[var(--line-khadi)]">
          <p className="eyebrow text-[var(--brand-gold)] mb-1">Bardoli Atelier</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            Request Your Handcrafted Pieces
          </h1>
          <p className="body-l text-[var(--ink-soft)] mt-2 max-w-2xl">
            No payment is collected online. We verify loom readiness, fabric reserves, and dispatch schedule before confirming your commission.
          </p>
        </div>

        {/* Two-Column Checkout Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          {/* Left Column (7 cols): Delivery Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Saved Addresses for Authenticated Customers */}
            {customer?.addresses?.length > 0 && (
              <div className="bg-white p-5 border border-[var(--line-khadi)] rounded-[2px] space-y-3 shadow-xs">
                <span className="caption uppercase font-semibold text-[var(--ink-chocolate)] tracking-wider">
                  Select a Saved Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customer.addresses.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDetails((d) => ({ ...d, ...a }));
                        setQuote(null);
                      }}
                      className={`text-left p-3 border rounded-[2px] text-xs transition-all ${
                        details.addressLine1 === a.addressLine1 && details.pincode === a.pincode
                          ? 'border-[var(--brand-maroon)] bg-[var(--brand-maroon-tint)]/25'
                          : 'border-[var(--line-khadi)] hover:border-[var(--brand-gold)] bg-white'
                      }`}
                    >
                      <p className="font-semibold text-[var(--ink-chocolate)] truncate">
                        {a.addressLine1}
                      </p>
                      <p className="text-[var(--ink-soft)] mt-0.5">
                        {a.city}, {a.state} - {a.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white p-6 md:p-8 border border-[var(--line-khadi)] rounded-[2px] shadow-xs space-y-5">
              <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg pb-3 border-b border-[var(--line-khadi)]">
                1. Contact Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label block mb-1">
                    Full Name <span className="text-[var(--brand-maroon)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={details.name}
                    onChange={(e) => change('name', e.target.value)}
                    placeholder="e.g. Radhika Patel"
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label block mb-1">
                      Email Address <span className="text-[var(--brand-maroon)]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={details.email}
                      onChange={(e) => change('email', e.target.value)}
                      placeholder="radhika@example.com"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label block mb-1">
                      Phone Number <span className="text-[var(--brand-maroon)]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[+0-9 ()-]{10,20}"
                      value={details.phone}
                      onChange={(e) => change('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 md:p-8 border border-[var(--line-khadi)] rounded-[2px] shadow-xs space-y-5">
              <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg pb-3 border-b border-[var(--line-khadi)]">
                2. Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label block mb-1">
                    Street Address <span className="text-[var(--brand-maroon)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={details.addressLine1}
                    onChange={(e) => change('addressLine1', e.target.value)}
                    placeholder="House / Flat / Road name"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label block mb-1">
                    Apartment / Suite / Landmark <span className="text-[var(--ink-soft)] text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={details.addressLine2}
                    onChange={(e) => change('addressLine2', e.target.value)}
                    placeholder="Near Heritage Square"
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label block mb-1">
                      City <span className="text-[var(--brand-maroon)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={details.city}
                      onChange={(e) => change('city', e.target.value)}
                      placeholder="Surat"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label block mb-1">
                      State <span className="text-[var(--brand-maroon)]">*</span>
                    </label>
                    <select
                      value={details.state}
                      onChange={(e) => change('state', e.target.value)}
                      className="form-select h-10 text-xs bg-white"
                      required
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label block mb-1">
                      PIN Code <span className="text-[var(--brand-maroon)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[1-9][0-9]{5}"
                      maxLength={6}
                      value={details.pincode}
                      onChange={(e) => change('pincode', e.target.value)}
                      placeholder="394601"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[var(--line-khadi)] rounded-[2px] p-6 md:p-8 space-y-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line-khadi)]">
                <h3 className="heading-3 text-[var(--ink-chocolate)] uppercase text-base">
                  Commission Summary
                </h3>
                <span className="caption text-[var(--brand-maroon)] font-semibold text-xs">
                  {cart.length} {cart.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[var(--line-khadi)]/60 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.key} className="py-3.5 first:pt-0 flex items-center gap-3">
                    <div className="w-14 h-18 bg-[var(--bg-cream)] flex-shrink-0 overflow-hidden rounded-[0px] border border-[var(--line-khadi)]/50">
                      <img
                        src={item.image || '/images/hero.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/hero.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold text-[var(--ink-chocolate)] truncate">
                        {item.title}
                      </p>
                      <p className="caption text-[11px] text-[var(--ink-soft)] mt-0.5">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <p className="price text-xs font-semibold mt-1">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Indicator */}
              {couponCode && (
                <div className="p-3 bg-[var(--bg-cream)] border border-[var(--line-khadi)] rounded-[2px] flex items-center justify-between text-xs">
                  <span className="caption text-[var(--brand-gold)] font-semibold">
                    ✦ Code Active: {couponCode}
                  </span>
                  {quote?.financials?.discountAmount > 0 && (
                    <span className="text-[var(--state-success)] font-semibold">
                      -{formatPrice(quote.financials.discountAmount)}
                    </span>
                  )}
                </div>
              )}

              {/* Financials Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-[var(--line-khadi)] text-xs">
                <div className="flex justify-between text-[var(--ink-soft)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--ink-chocolate)] font-medium">
                    {formatPrice(quote?.financials?.subtotal || subtotalEstimate)}
                  </span>
                </div>

                {quote?.financials?.discountAmount > 0 && (
                  <div className="flex justify-between text-[var(--state-success)] font-medium">
                    <span>Atelier Discount</span>
                    <span>-{formatPrice(quote.financials.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[var(--ink-soft)]">
                  <span>Domestic Insured Shipping</span>
                  <span className="text-[var(--ink-chocolate)] font-medium">
                    {quote?.financials?.shippingFee === 0
                      ? 'Complimentary'
                      : quote?.financials?.shippingFee
                      ? formatPrice(quote.financials.shippingFee)
                      : 'Calculated by PIN'}
                  </span>
                </div>

                {quote?.deliveryDays && (
                  <div className="flex justify-between text-[var(--ink-soft)] pt-1">
                    <span>Estimated Loom & Delivery</span>
                    <span className="text-[var(--brand-maroon)] font-semibold">
                      {quote.deliveryDays} business days
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-[var(--ink-chocolate)] pt-3 border-t border-[var(--line-khadi)]">
                  <span>Estimated Total</span>
                  <span className="price text-xl text-[var(--brand-maroon)]">
                    {formatPrice(quote?.financials?.totalAmount || subtotalEstimate)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[2px] flex items-center gap-2 text-xs text-[var(--state-error)]" role="alert">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary btn-lg w-full justify-center uppercase tracking-wider text-sm shadow-sm"
              >
                {busy ? (
                  <span>Checking Atelier Looms...</span>
                ) : quote ? (
                  <span>Confirm & Request Pieces</span>
                ) : (
                  <span>Verify Availability & Continue</span>
                )}
              </button>

              {/* Atelier Trust Badges */}
              <div className="pt-4 border-t border-[var(--line-khadi)]/60 space-y-2 text-[11px] text-[var(--ink-soft)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--brand-gold)] flex-shrink-0" />
                  <span>100% Certified Authentic Handloom & Natural Dyes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[var(--brand-gold)] flex-shrink-0" />
                  <span>Zero upfront payment. Handcrafted on confirmed request.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[var(--brand-gold)] flex-shrink-0" />
                  <span>Insured doorstep delivery directly from Bardoli studio</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
