import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, AlertCircle, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown.jsx';
import { useStore } from '../context/store.js';
import { api } from '../api/client.js';
import { cartItems, checkoutKey } from '../lib/commerce.js';

const INDIAN_STATES = [
  'Andaman & Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

function OrderSummaryContent({ cart, subtotal, discountAmount, couponCode, shippingFee, grandTotal }) {
  return (
    <>
      {/* Line items */}
      <div className="divide-y divide-[var(--color-line)] max-h-64 overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={item.key} className="py-3 flex items-center gap-3">
            <img
              src={item.image || '/images/hero-home.jpg'}
              alt={item.title}
              className="w-14 aspect-[3/4] object-cover rounded-[4px] bg-[var(--color-sand)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-ink)] truncate">{item.title}</p>
              <p className="text-[11px] text-[var(--color-muted)]">
                Size: {item.size} · Qty: {item.quantity}
              </p>
            </div>
            <span className="price-tabular text-xs font-semibold text-[var(--color-ink)]">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-[var(--color-line)] pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-[var(--color-muted)]">
          <span>Subtotal</span>
          <span className="price-tabular text-[var(--color-ink)] font-semibold">
            ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-[var(--color-success)] font-semibold">
            <span>Coupon Discount ({couponCode})</span>
            <span className="price-tabular">-₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between text-[var(--color-muted)]">
          <span>Insured Handloom Delivery</span>
          <span>{shippingFee === 0 ? <strong className="text-[var(--color-success)]">FREE</strong> : `₹${shippingFee}`}</span>
        </div>

        <div className="border-t border-[var(--color-line)] pt-3 flex justify-between text-base font-semibold text-[var(--color-ink)]">
          <span>Total Amount</span>
          <span className="price-tabular text-xl">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="p-3 bg-[var(--color-cream)]/70 rounded-[6px] text-[11px] text-[var(--color-muted)] space-y-1">
        <p>• Authentic Gandhian handspun certified Khadi.</p>
        <p>• Complimentary GST tax invoice dispatched via email.</p>
      </div>
    </>
  );
}

export default function CheckoutPage({ navigate, onOrderComplete }) {
  const { settings, cart, customer, clearCart, couponCode, refreshCustomer, addToast } = useStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Preview
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'razorpay' | 'cod'

  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    addressLine1: customer?.addresses?.[0]?.addressLine1 || '',
    addressLine2: customer?.addresses?.[0]?.addressLine2 || '',
    city: customer?.addresses?.[0]?.city || '',
    state: customer?.addresses?.[0]?.state || 'Gujarat',
    pincode: customer?.addresses?.[0]?.pincode || '',
  });

  const [quote, setQuote] = useState(null);

  const subtotal = quote?.subtotal ?? cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = quote?.shippingFee ?? (subtotal >= 5000 ? 0 : 250);
  const discountAmount = quote?.discountAmount ?? 0;
  const grandTotal = quote?.totalAmount ?? Math.max(0, subtotal - discountAmount + shippingFee);

  // Quote cart from backend
  useEffect(() => {
    if (cart.length > 0) {
      api
        .quoteCart({
          items: cartItems(cart),
          couponCode,
        })
        .then((res) => {
          if (res?.success && res.financials) {
            setQuote(res.financials);
          } else if (res?.success && res.data?.financials) {
            setQuote(res.data.financials);
          } else {
            setQuote(null);
          }
        })
        .catch(() => setQuote(null));
    }
  }, [cart, couponCode]);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Please enter your full name';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');
    if (!form.phone.trim()) {
      errs.phone = 'Please enter your phone number';
    } else if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!form.addressLine1.trim()) {
      errs.addressLine1 = 'Please enter your street address';
    }

    if (!form.city.trim()) {
      errs.city = 'Please enter your city';
    }

    if (!form.pincode.trim()) {
      errs.pincode = 'Please enter your 6-digit PIN code';
    } else if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      errs.pincode = 'Please enter a valid 6-digit Indian PIN code';
    }

    if (!form.state) {
      errs.state = 'Please select a state';
    }

    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setError('');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please review and correct the highlighted fields before proceeding.');
      const firstField = Object.keys(errs)[0];
      const el = document.getElementById(`checkout-${firstField}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (busy || settings?.demoMode) return;
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setStep(1);
      setError('Please correct your contact and delivery details before placing your order.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const items = cartItems(cart);
      const { name, email, phone, ...shippingAddress } = form;
      const payload = {
        customer: { name, email, phone, shippingAddress },
        items,
        couponCode: couponCode || undefined,
        paymentGateway: paymentMethod,
      };

      const res = await api.createOrder(payload, checkoutKey(payload));
      if (!res.success) {
        if (res.code === 'CHECKOUT_EXPIRED') sessionStorage.removeItem('rv_checkout');
        throw new Error(res.message || 'Could not place order request');
      }

      const orderData = res.data;
      sessionStorage.setItem(`rv_order_${orderData.orderNumber}`, orderData.accessToken || '');

      const codRes = await api.confirmCodOrder(orderData.orderNumber, orderData.accessToken);
      if (!codRes?.success) {
        if (codRes?.code === 'CHECKOUT_EXPIRED') sessionStorage.removeItem('rv_checkout');
        throw new Error(codRes?.message || 'Could not confirm Cash on Delivery');
      }
      orderData.payment = { ...orderData.payment, gateway: 'cod', status: codRes.data.paymentStatus };
      orderData.fulfillment = { ...orderData.fulfillment, status: codRes.data.fulfillmentStatus };

      clearCart();
      await refreshCustomer?.();
      addToast('Order confirmed with the atelier!', 'success');
      onOrderComplete(orderData);
    } catch (err) {
      setError(err.message || 'Payment or order failed. Please verify your details.');
    } finally {
      setBusy(false);
    }
  };


  if (cart.length === 0) {
    return (
      <main className="rv-container py-24 text-center">
        <h2 className="font-display text-3xl text-[var(--color-ink)] mb-3">Your Bag is Empty</h2>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Add pieces from our handcrafted edits to proceed to checkout.
        </p>
        <button onClick={() => navigate({ page: 'shop' })} className="btn-primary">
          Explore Catalog
        </button>
      </main>
    );
  }

  return (
    <div className="w-full bg-[var(--color-paper)] text-[var(--color-ink)] py-8 md:py-16 min-h-screen">
      <div className="rv-container max-w-6xl">
        {settings?.demoMode && <p role="status" className="mb-6 border border-[var(--color-line)] bg-[var(--color-cream)] p-4 text-sm">Demo checkout: review your pieces and explore the form. No order will be placed and no payment will be taken.</p>}
        <header className="checkout-heading"><h1>Make it yours.</h1><p>A few details, and your pieces are one step closer.</p></header>
        {/* Navigation & Stepper Header (§12: visible 3-step stepper) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--color-line)] gap-4">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate({ page: 'shop' }))}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors self-start"
          >
            <ArrowLeft size={16} />
            <span>{step === 2 ? 'Back to Address' : 'Continue Shopping'}</span>
          </button>

          {/* Stepper (§12) */}
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
            <span className={step >= 1 ? 'text-[var(--color-clay)]' : 'text-[var(--color-muted)]'}>
              1. Contact &amp; Delivery
            </span>
            <span className="text-[var(--color-line)]">/</span>
            <span className={step >= 2 ? 'text-[var(--color-clay)]' : 'text-[var(--color-muted)]'}>
              2. Review &amp; Payment
            </span>
          </div>
        </div>

        {/* Mobile Collapsible Order Summary Accordion (Visible on < lg screens) */}
        <div className="lg:hidden mt-6 border border-[var(--color-line)] rounded-[8px] bg-[var(--color-white)] overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between bg-[var(--color-cream)]/50 text-left transition-colors hover:bg-[var(--color-cream)] cursor-pointer"
            aria-expanded={mobileSummaryOpen}
            aria-controls="mobile-order-summary-panel"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
              <ShoppingBag size={16} className="text-[var(--color-clay)]" />
              <span>{mobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
              {mobileSummaryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
            <span className="price-tabular text-sm font-bold text-[var(--color-ink)]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </button>

          {mobileSummaryOpen && (
            <div id="mobile-order-summary-panel" className="p-4 border-t border-[var(--color-line)] space-y-4 animate-fade-in">
              <OrderSummaryContent
                cart={cart}
                subtotal={subtotal}
                discountAmount={discountAmount}
                couponCode={couponCode}
                shippingFee={shippingFee}
                grandTotal={grandTotal}
              />
            </div>
          )}
        </div>

        {/* Checkout Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-8 items-start">
          {/* Left Form (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            {error && (
              <div className="p-4 bg-[var(--color-cream)] border border-[var(--color-error)] rounded-[8px] flex items-center gap-2.5 text-xs text-[var(--color-error)] font-medium animate-shake" role="alert">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Contact & Shipping */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} noValidate className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal mb-1">
                    Contact Information
                  </h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    Order confirmation, tax invoice, and courier tracking will be sent here.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-name" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Full Name <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="input-base"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? "checkout-name-error" : undefined}
                      required
                    />
                    {fieldErrors.name && (
                      <p id="checkout-name-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="checkout-email" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Email Address <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="name@example.com"
                      className="input-base"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "checkout-email-error" : undefined}
                      required
                    />
                    {fieldErrors.email && (
                      <p id="checkout-email-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="checkout-phone" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Phone Number <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-base"
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? "checkout-phone-error" : undefined}
                      required
                    />
                    {fieldErrors.phone && (
                      <p id="checkout-phone-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--color-line)] pt-6">
                  <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal mb-1">
                    Delivery Address
                  </h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    Insured handloom courier dispatch from Bardoli, Gujarat.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-addressLine1" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Street Address <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input
                      id="checkout-addressLine1"
                      type="text"
                      value={form.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      placeholder="Flat, Wing, House No., Building Name, Street"
                      className="input-base"
                      aria-invalid={Boolean(fieldErrors.addressLine1)}
                      aria-describedby={fieldErrors.addressLine1 ? "checkout-addressLine1-error" : undefined}
                      required
                    />
                    {fieldErrors.addressLine1 && (
                      <p id="checkout-addressLine1-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{fieldErrors.addressLine1}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="checkout-addressLine2" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Locality / Landmark (Optional)
                    </label>
                    <input
                      id="checkout-addressLine2"
                      type="text"
                      value={form.addressLine2}
                      onChange={(e) => handleChange('addressLine2', e.target.value)}
                      placeholder="Apartment complex, landmark"
                      className="input-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="checkout-city" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                        City <span className="text-[var(--color-clay)]">*</span>
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="e.g. Surat"
                        className="input-base"
                        aria-invalid={Boolean(fieldErrors.city)}
                        aria-describedby={fieldErrors.city ? "checkout-city-error" : undefined}
                        required
                      />
                      {fieldErrors.city && (
                        <p id="checkout-city-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{fieldErrors.city}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-pincode" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                        PIN Code <span className="text-[var(--color-clay)]">*</span>
                      </label>
                      <input
                        id="checkout-pincode"
                        type="text"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="395007"
                        className="input-base"
                        aria-invalid={Boolean(fieldErrors.pincode)}
                        aria-describedby={fieldErrors.pincode ? "checkout-pincode-error" : undefined}
                        required
                      />
                      {fieldErrors.pincode && (
                        <p id="checkout-pincode-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{fieldErrors.pincode}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-state" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                        State <span className="text-[var(--color-clay)]">*</span>
                      </label>
                      <CustomDropdown
                        id="checkout-state"
                        options={INDIAN_STATES}
                        value={form.state}
                        onChange={(val) => handleChange('state', val)}
                        placeholder="Select State"
                        size="md"
                        className="w-full"
                        buttonClassName={`input-base !flex !items-center !justify-between !h-12 !rounded-[8px] !bg-[var(--color-paper)] !text-[var(--color-ink)] !text-[15px] cursor-pointer ${
                          fieldErrors.state ? '!border-[var(--color-error)]' : '!border-[var(--color-line)]'
                        }`}
                        menuClassName="w-full min-w-full max-h-60 overflow-y-auto !rounded-[8px] !bg-[var(--color-white)] !border-[var(--color-line)] shadow-lg"
                        aria-invalid={Boolean(fieldErrors.state)}
                        aria-describedby={fieldErrors.state ? "checkout-state-error" : undefined}
                      />
                      {fieldErrors.state && (
                        <p id="checkout-state-error" className="text-xs text-[var(--color-error)] mt-1.5 flex items-center gap-1 font-medium" role="alert">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{fieldErrors.state}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full h-12">
                    <span>Continue to Payment</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Preview & Confirmation */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Delivery Summary Review */}
                <div className="p-5 bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      Deliver to
                    </span>
                    <p className="font-semibold text-sm text-[var(--color-ink)] mt-1">{form.name}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {form.addressLine1}, {form.city}, {form.state} — {form.pincode}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">{form.phone} · {form.email}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[var(--color-clay)] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Rail Options (§4 PRD: Razorpay Payments) */}
                <div>
                  <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal mb-3">
                    Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* Option 1: Razorpay UPI & Cards */}
                    <label
                      className={`p-4 border rounded-[8px] flex items-start gap-3 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                        ? 'border-[var(--color-ink)] bg-[var(--color-white)] shadow-sm'
                        : 'border-[var(--color-line)] bg-[var(--color-paper)]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        disabled
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 accent-[var(--color-clay)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[var(--color-ink)]">
                            Razorpay (UPI, Google Pay, PhonePe, Cards, Netbanking)
                          </span>
                          <span className="text-[11px] font-bold text-[var(--color-success)] bg-[var(--color-cream)] px-2 py-0.5 rounded-[2px]">
                            Coming soon
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          Online payments will be available once payment setup is complete.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Cash on Delivery / Atelier Concierge */}
                    <label
                      className={`p-4 border rounded-[8px] flex items-start gap-3 cursor-pointer transition-all ${paymentMethod === 'cod'
                        ? 'border-[var(--color-ink)] bg-[var(--color-white)] shadow-sm'
                        : 'border-[var(--color-line)] bg-[var(--color-paper)]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[var(--color-clay)]"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[var(--color-ink)]">
                          Pay upon Delivery (Cash / Concierge UPI)
                        </span>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          Inspect your handloom piece at delivery before making payment.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={busy || settings?.demoMode}
                    onClick={handlePlaceOrder}
                    className="btn-primary w-full h-12 text-sm uppercase tracking-wider font-semibold"
                  >
                    {settings?.demoMode ? 'Demo preview — ordering disabled' : busy ? 'Securing your order…' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Confirm`}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-muted)] pt-2">
                  <Lock size={14} />
                  <span>256-Bit Bank-Grade Tokenized SSL Encryption</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Order Summary Panel (§12 - Desktop) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] p-6 shadow-sm space-y-4">
            <h3 className="font-display text-xl text-[var(--color-ink)] font-normal border-b border-[var(--color-line)] pb-3">
              Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>
            <OrderSummaryContent
              cart={cart}
              subtotal={subtotal}
              discountAmount={discountAmount}
              couponCode={couponCode}
              shippingFee={shippingFee}
              grandTotal={grandTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
