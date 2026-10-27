import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, AlertCircle, } from 'lucide-react';
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

export default function CheckoutPage({ navigate, onOrderComplete }) {
  const { settings, cart, customer, clearCart, couponCode, refreshCustomer, addToast } = useStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Preview
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'stripe'

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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in your contact information');
      return;
    }
    if (!form.addressLine1.trim() || !form.city.trim() || !/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      setError('Please provide a complete delivery address with a valid 6-digit Indian PIN code');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
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
        throw new Error(res.message || 'Could not place order request');
      }

      const orderData = res.data;
      sessionStorage.setItem(`rv_order_${orderData.orderNumber}`, orderData.accessToken || '');

      // 1. Razorpay Payment Rail
      if (paymentMethod === 'razorpay') {
        const rzRes = await api.createRazorpayOrder(orderData.orderNumber);
        if (!rzRes.success) {
          throw new Error(rzRes.message || 'Failed to initialize payment gateway');
        }

        if (!rzRes.sandbox) {
          if (!window.Razorpay) {
            throw new Error('Payment gateway could not load. Please disable ad-blockers and retry.');
          }
          const rzpOptions = {
            key: rzRes.data.keyId,
            amount: rzRes.data.amount,
            currency: rzRes.data.currency || 'INR',
            name: 'Rangvanat Studio',
            description: `Khadi Art Order ${orderData.orderNumber}`,
            order_id: rzRes.data.razorpayOrderId,
            prefill: {
              name: form.name,
              email: form.email,
              contact: form.phone,
            },
            theme: {
              color: '#B4552D',
            },
            handler: async (response) => {
              try {
                const verifyRes = await api.verifyRazorpayPayment(orderData.orderNumber, response);
                if (verifyRes.success) {
                  clearCart();
                  await refreshCustomer?.();
                  addToast('Payment verified! Your handcrafted piece is being prepared.', 'success');
                  onOrderComplete(orderData);
                } else {
                  setError('Payment verification failed. Please contact studio support.');
                }
              } catch {
                setError('Payment verification error. Please contact studio support.');
              }
            },
            modal: {
              ondismiss: () => {
                setBusy(false);
                addToast('Payment dismissed. Your order request remains saved.', 'info');
              },
            },
          };

          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
          return;
        }

        // Sandbox / Test fallback verification
        const mockRes = await api.verifyRazorpayPayment(orderData.orderNumber, {
          razorpay_order_id: rzRes.data.razorpayOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'sandbox_signature',
        });
        if (!mockRes?.success) {
          throw new Error(mockRes?.message || 'Payment verification failed');
        }
      } else if (paymentMethod === 'cod') {
        // 2. Cash on Delivery Rail
        const codRes = await api.confirmCodOrder(orderData.orderNumber);
        if (!codRes?.success) {
          throw new Error(codRes?.message || 'Could not confirm Cash on Delivery');
        }
      }

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

  if (settings?.demoMode) return <main className="rv-container py-24 text-center"><h1>Explore the demo.</h1><p className="my-6">Prices, sizes, stock and photos are sample data. Orders and payments are disabled.</p><button className="btn btn-primary" onClick={() => navigate({ page: 'shop' })}>Continue exploring</button></main>;

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

        {/* Checkout Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-8 items-start">
          {/* Left Form (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            {error && (
              <div className="p-4 bg-[var(--color-cream)] border border-[var(--color-error)] rounded-[8px] flex items-center gap-2.5 text-xs text-[var(--color-error)] font-medium animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Contact & Shipping */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
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
                    <input id="checkout-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="input-base"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-email" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Email Address <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input id="checkout-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="name@example.com"
                      className="input-base"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-phone" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Phone Number <span className="text-[var(--color-clay)]">*</span>
                    </label>
                    <input id="checkout-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-base"
                      required
                    />
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
                    <input id="checkout-addressLine1"
                      type="text"
                      value={form.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      placeholder="Flat, Wing, House No., Building Name, Street"
                      className="input-base"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-addressLine2" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                      Locality / Landmark (Optional)
                    </label>
                    <input id="checkout-addressLine2"
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
                      <input id="checkout-city"
                        type="text"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="e.g. Surat"
                        className="input-base"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-pincode" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                        PIN Code <span className="text-[var(--color-clay)]">*</span>
                      </label>
                      <input id="checkout-pincode"
                        type="text"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="395007"
                        className="input-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] block mb-1">
                        State <span className="text-[var(--color-clay)]">*</span>
                      </label>
                      <select
                        value={form.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="input-base cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
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

                {/* Payment Rail Options (§4 PRD: Dual Payment Rails) */}
                <div>
                  <h3 className="font-display text-2xl text-[var(--color-ink)] font-normal mb-3">
                    Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* Option 1: Razorpay UPI & Cards */}
                    <label
                      className={`p-4 border rounded-[8px] flex items-start gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-[var(--color-ink)] bg-[var(--color-white)] shadow-sm'
                          : 'border-[var(--color-line)] bg-[var(--color-paper)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
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
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          Instant UPI &amp; bank payment with 100% zero-drop confirmation.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Cash on Delivery / Atelier Concierge */}
                    <label
                      className={`p-4 border rounded-[8px] flex items-start gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
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
                    disabled={busy}
                    onClick={handlePlaceOrder}
                    className="btn-primary w-full h-12 text-sm uppercase tracking-wider font-semibold"
                  >
                    {busy ? 'Securing your order…' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Confirm`}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-muted)] pt-2">
                  <Lock size={14} />
                  <span>256-Bit Bank-Grade Tokenized SSL Encryption</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Order Summary Panel (§12) */}
          <div className="lg:col-span-5 sticky top-24 bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] p-6 shadow-sm space-y-4">
            <h3 className="font-display text-xl text-[var(--color-ink)] font-normal border-b border-[var(--color-line)] pb-3">
              Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>

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
          </div>
        </div>
      </div>
    </div>
  );
}
