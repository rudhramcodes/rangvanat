import { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../api/client.js';

export default function CheckoutPage({ navigate, onOrderComplete }) {
  const { cart, subtotal, clearCart, formatPrice, addToast, customer } = useStore();

  const [step, setStep] = useState(1); // 1: Contact, 2: Address, 3: Delivery, 4: Payment, 5: Review
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [name, setName] = useState(customer?.name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('express');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const SHIPPING_THRESHOLD = 15000;
  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 500;
  const totalAmount = Math.max(0, subtotal + shippingFee);

  if (cart.length === 0) {
    return (
      <main id="main-content" className="rv-container py-24 text-center">
        <h2 className="heading-2 text-[var(--brand-maroon)]">Your Bag is Empty</h2>
        <p className="body-s text-[var(--ink-soft)] my-4">Please add pieces before proceeding to checkout.</p>
        <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-md">
          Return to Shop
        </button>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name,
          email,
          phone,
          shippingAddress: {
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            country: 'India',
          },
        },
        items: cart.map((item) => ({
          productId: item.id,
          slug: item.slug,
          title: item.title,
          image: item.image,
          variantSize: item.size,
          customMeasurements: item.customMeasurements,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        financials: {
          subtotal,
          discountAmount: 0,
          shippingFee,
          totalAmount,
        },
        paymentMethod,
      };

      const res = await api.createOrder(payload);
      if (res?.success && res.data) {
        clearCart();
        addToast('Order confirmed! Weaving ticket generated.', 'success');
        onOrderComplete(res.data);
      } else {
        addToast(res?.message || 'Could not place order', 'error');
      }
    } catch (err) {
      addToast('Order processing failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="rv-container py-12">
      {/* Header & Progress Indicator (§12.5) */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-between pb-3">
          <span className="caption uppercase tracking-widest text-[var(--ink-soft)] font-semibold">
            Atelier Checkout · Step {step} of 5
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
            <Lock size={13} className="text-[var(--brand-gold)]" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* 3px Gold Progress Bar */}
        <div className="w-full h-[3px] bg-[var(--line-khadi)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--brand-gold)] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Flow (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-[var(--line-khadi)] rounded-[2px] shadow-sm space-y-6">
          {/* STEP 1: CONTACT */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-xl">
                1. Contact Information
              </h2>
              <p className="body-s text-[var(--ink-soft)]">
                We send order milestones, artisan updates, and dispatch tracking here.
              </p>

              <div>
                <label className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Mobile Number (for Courier & WhatsApp updates) <span className="required-star">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={!name || !email || !phone}
                  onClick={() => setStep(2)}
                  className="btn btn-primary btn-md w-full justify-center uppercase tracking-wider"
                >
                  Continue to Address →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-xl">
                  2. Shipping Destination
                </h2>
                <button onClick={() => setStep(1)} className="btn-ghost text-xs">
                  Edit Contact
                </button>
              </div>

              <div>
                <label className="form-label">
                  House / Flat / Building No. <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 402, Heritage Enclave"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Street / Area / Landmark</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Near Gandhi Ashram, Bardoli"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Surat / Ahmedabad"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">
                    PIN Code <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="394601"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-select"
                >
                  {['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary btn-md">
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!addressLine1 || !city || !pincode}
                  onClick={() => setStep(3)}
                  className="btn btn-primary btn-md flex-grow justify-center"
                >
                  Continue to Delivery →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY METHOD */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-xl">
                  3. Delivery Method
                </h2>
                <button onClick={() => setStep(2)} className="btn-ghost text-xs">
                  Edit Address
                </button>
              </div>

              <div className="space-y-3">
                <label
                  className={`block p-4 border rounded-[2px] cursor-pointer transition-all ${
                    deliveryMethod === 'express'
                      ? 'border-[var(--brand-maroon)] bg-[var(--brand-maroon-tint)]/20'
                      : 'border-[var(--line-khadi)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="accent-[var(--brand-maroon)]"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[var(--ink-chocolate)]">
                          BlueDart Insured Air Express
                        </p>
                        <p className="caption text-xs text-[var(--ink-soft)]">
                          Estimated delivery in 3 to 5 business days with tamper-evident seal.
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[var(--brand-maroon)]">
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary btn-md">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn btn-primary btn-md flex-grow justify-center"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT OPTIONS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-xl">
                  4. Payment Selection
                </h2>
                <button onClick={() => setStep(3)} className="btn-ghost text-xs">
                  Edit Delivery
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'card',
                    title: 'Credit / Debit Card (Razorpay Gateway)',
                    desc: 'Visa, MasterCard, Amex, Rupay. Instant confirmation.',
                  },
                  {
                    id: 'upi',
                    title: 'Instant UPI / QR Code',
                    desc: 'Google Pay, PhonePe, Paytm, BHIM UPI with instant receipt.',
                  },
                  {
                    id: 'cod',
                    title: 'Cash on Delivery (COD)',
                    desc: 'Pay cash or UPI upon delivery. Available across India.',
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`block p-4 border rounded-[2px] cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-[var(--brand-maroon)] bg-[var(--brand-maroon-tint)]/20'
                        : 'border-[var(--line-khadi)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-[var(--brand-maroon)] mt-1"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[var(--ink-chocolate)]">{pm.title}</p>
                        <p className="caption text-xs text-[var(--ink-soft)]">{pm.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn btn-secondary btn-md">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="btn btn-primary btn-md flex-grow justify-center"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PLACE ORDER */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-xl">
                5. Review & Place Order
              </h2>

              <div className="bg-[var(--bg-cream)]/70 p-4 rounded-[2px] space-y-2 text-sm">
                <p>
                  <strong>Recipient:</strong> {name} ({phone})
                </p>
                <p>
                  <strong>Destination:</strong> {addressLine1}, {addressLine2 ? addressLine2 + ', ' : ''}
                  {city}, {state} - {pincode}
                </p>
                <p>
                  <strong>Payment Method:</strong> {paymentMethod.toUpperCase()}
                </p>
              </div>

              <p className="caption text-[var(--ink-soft)] text-xs">
                By placing this order, you authorize Rangvanat Studio to reserve handcrafted pieces in our loom inventory.
              </p>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep(4)} className="btn btn-secondary btn-md">
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="btn btn-primary btn-lg flex-grow justify-center tracking-widest text-base uppercase"
                >
                  {submitting ? 'Weaving Order...' : `Confirm & Pay ${formatPrice(totalAmount)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Rail (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[var(--line-khadi)] p-6 rounded-[2px] shadow-sm">
            <h3 className="heading-3 text-[var(--brand-maroon)] text-base uppercase mb-4 pb-2 border-b border-[var(--line-khadi)]">
              Bag Summary ({cart.length} Pieces)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[var(--line-khadi)] pr-2">
              {cart.map((item) => (
                <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-14 object-cover" />
                    <div>
                      <p className="font-medium text-[var(--ink-chocolate)] line-clamp-1">{item.title}</p>
                      <p className="caption text-xs text-[var(--ink-soft)]">
                        Qty {item.quantity} · {item.size}
                      </p>
                    </div>
                  </div>
                  <span className="price text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--line-khadi)] space-y-2 text-sm mt-4">
              <div className="flex justify-between">
                <span className="text-[var(--ink-soft)]">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-soft)]">Domestic Shipping</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? <span className="text-[var(--state-success)] font-bold">FREE</span> : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-[var(--brand-maroon)] flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="price text-xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
