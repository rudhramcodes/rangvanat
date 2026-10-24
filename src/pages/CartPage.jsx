import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useStore } from '../context/store.js';
import { cartItems } from '../lib/commerce';
import { api } from '../api/client.js';

export default function CartPage({ navigate }) {
  const { cart, subtotal, removeFromCart, updateQuantity, clearCart, formatPrice, addToast, couponCode: savedCoupon, setCouponCode: saveCoupon, settings } = useStore();
  const [couponCode, setCouponCode] = useState(savedCoupon);
  const [quote,setQuote]=useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const SHIPPING_THRESHOLD = settings?.freeShippingThreshold ?? 0;
  const shippingFee = quote?.financials.shippingFee ?? (subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : (settings?.shippingFee || 0));
  const finalTotal = quote?.financials.totalAmount ?? Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await api.quote(cartItems(cart),couponCode);
      if (res?.success && res.data) {
        setQuote(res.data);
        setDiscountAmount(res.data.financials.discountAmount);
        setAppliedCoupon(res.data.financials.couponCode);
        saveCoupon(couponCode);
        addToast(res.data.message || 'Coupon applied successfully!', 'success');
      } else {
        addToast(res?.message || 'Invalid or expired coupon', 'error');
      }
    } catch {
      addToast('Error validating coupon', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  useEffect(()=>{let active=true;if(cart.length)api.quote(cartItems(cart),savedCoupon).then(r=>{if(active){if(r.success){setQuote(r.data);setDiscountAmount(r.data.financials.discountAmount);setAppliedCoupon(r.data.financials.couponCode);}else {setQuote(null);setDiscountAmount(0);setAppliedCoupon(null);addToast(r.message,'error');}}});return()=>{active=false;};},[cart,savedCoupon,addToast]);
  if (cart.length === 0) {
    return (
      <main id="main-content" className="rv-container py-24 text-center">
        <p className="serif-statement text-3xl text-[var(--ink-chocolate)] mb-4">
          "Your bag is empty, the loom is not."
        </p>
        <p className="body-l text-[var(--ink-soft)] max-w-md mx-auto mb-8">
          Explore our seasonal edits loomed with authentic organic dyes and hand-spun cotton.
        </p>
        <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-lg">
          Explore Atelier Collection
        </button>
      </main>
    );
  }

  return (
    <main id="main-content" className="rv-container py-12">
      {/* Breadcrumbs */}
      <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
        <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
          Home
        </button>
        <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
        <span className="text-[var(--brand-maroon)] font-semibold">Shopping Bag</span>
      </nav>

      <h1 className="heading-1 text-[var(--brand-maroon)] mb-8 uppercase">Your Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items Table (7 Cols) */}
        <div className="lg:col-span-8">
          <div className="hidden md:grid grid-cols-12 pb-3 border-b border-[var(--line-khadi)] caption text-[var(--ink-soft)] uppercase tracking-wider font-semibold">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-[var(--line-khadi)]">
            {cart.map((item) => (
              <div key={item.key} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Item Details (Col 6) */}
                <div className="md:col-span-6 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-26 object-cover bg-[var(--bg-cream)] flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => navigate({ page: 'product', id: item.slug })}
                        className="font-medium text-[15.5px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <p className="caption text-[var(--ink-soft)] mt-1">
                        Size: <strong className="text-[var(--ink-chocolate)]">{item.size}</strong>
                      </p>
                      {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                        <p className="caption text-[var(--brand-maroon)] text-xs mt-0.5">
                          Bespoke Tailored (Bust: {item.customMeasurements.bust}", Waist: {item.customMeasurements.waist}")
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="text-xs text-[var(--ink-soft)] hover:text-[var(--state-error)] self-start flex items-center gap-1 mt-2"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Quantity (Col 2) */}
                <div className="md:col-span-2 flex md:justify-center">
                  <div className="quantity-stepper h-8">
                    <button onClick={() => updateQuantity(item.key, -1)} aria-label="Decrease quantity">
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, 1)} aria-label="Increase quantity">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* Unit Price (Col 2) */}
                <div className="md:col-span-2 text-right hidden md:block text-sm text-[var(--ink-chocolate)]">
                  {formatPrice(item.price)}
                </div>

                {/* Line Total (Col 2) */}
                <div className="md:col-span-2 text-right">
                  <span className="price text-base font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-[var(--line-khadi)]">
            <button
              onClick={() => navigate({ page: 'shop' })}
              className="btn-ghost text-sm font-semibold text-[var(--brand-maroon)]"
            >
              ← Continue Shopping
            </button>
            <button onClick={clearCart} className="btn-ghost text-xs text-[var(--ink-soft)] hover:text-[var(--state-error)]">
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Right: Order Summary Rail (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[var(--line-khadi)] p-6 rounded-[2px] shadow-sm space-y-5">
            <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg border-b border-[var(--line-khadi)] pb-3">
              Order Summary
            </h2>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">Subtotal</span>
              <span className="font-semibold text-[var(--ink-chocolate)]">{formatPrice(quote?.financials.subtotal ?? subtotal)}</span>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-[var(--state-success)]">
                <span>Coupon ({appliedCoupon})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">Domestic Shipping</span>
              <span className="font-semibold text-[var(--ink-chocolate)]">
                {shippingFee === 0 ? (
                  <span className="text-[var(--state-success)] uppercase text-xs font-bold">Complimentary</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-[var(--line-khadi)]">
              <label className="caption font-semibold text-[var(--ink-soft)] mb-1 block">
                Have a Loom Invite Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input h-9 text-xs uppercase"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="btn btn-secondary btn-sm whitespace-nowrap text-xs"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            </form>

            {/* Total */}
            <div className="pt-4 border-t-2 border-[var(--brand-maroon)] flex items-baseline justify-between">
              <span className="font-display text-xl uppercase tracking-wider text-[var(--ink-chocolate)]">
                Estimated Total
              </span>
              <span className="price text-2xl font-bold">{formatPrice(finalTotal)}</span>
            </div>

            <p className="caption text-[var(--ink-soft)] text-xs">
              Taxes included. Certified organic packaging & handloom guarantee certificate enclosed.
            </p>

            {/* Primary Proceed to Checkout */}
            <button
              onClick={() => navigate({ page: 'checkout' })}
              className="btn btn-primary btn-lg w-full justify-center tracking-widest text-base uppercase"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="text-center pt-3 border-t border-[var(--line-khadi)]/50">
              <p className="caption text-[var(--ink-soft)] text-xs">
                Insured luxury packaging with tamper-evident seal included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
