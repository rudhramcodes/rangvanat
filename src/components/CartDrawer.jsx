import { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, Check } from 'lucide-react';
import { useStore } from '../context/store.js';
import { api } from '../api/client.js';
import { useDialog } from '../lib/useDialog.js';
import { cartItems } from '../lib/commerce.js';

export default function CartDrawer({ navigate }) {
  const {
    cart,
    cartCount,
    subtotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    settings,
    couponCode,
    setCouponCode,
    addToast,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState(couponCode || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const SHIPPING_THRESHOLD = settings?.freeShippingThreshold || 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
  const diffToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setCouponLoading(true);

    try {
      const res = await api.quoteCart({
        items: cartItems(cart),
        couponCode: inputCoupon.trim().toUpperCase(),
      });

      setCouponLoading(false);
      if (res.discountAmount > 0) {
        setCouponCode(inputCoupon.trim().toUpperCase());
        setCouponDiscount(res.discountAmount);
        addToast(`Coupon ${inputCoupon.toUpperCase()} applied! Saved ₹${res.discountAmount}`, 'success');
      } else {
        addToast('Invalid or inapplicable coupon code for this bag', 'error');
      }
    } catch {
      setCouponLoading(false);
      // Fallback local check for demo coupons
      if (inputCoupon.trim().toUpperCase() === 'KHADI10') {
        const discount = Math.round(subtotal * 0.1);
        setCouponCode('KHADI10');
        setCouponDiscount(discount);
        addToast('10% Khadi discount applied!', 'success');
      } else if (inputCoupon.trim().toUpperCase() === 'RANGVANAT500') {
        setCouponCode('RANGVANAT500');
        setCouponDiscount(500);
        addToast('₹500 Atelier voucher applied!', 'success');
      } else {
        addToast('Coupon not valid or expired', 'error');
      }
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setInputCoupon('');
    setCouponDiscount(0);
    addToast('Coupon removed', 'info');
  };

  const dialogRef = useDialog(isCartOpen, closeCart);

  return (
    <div className={`rv-cart-layer ${isCartOpen ? 'is-open' : ''}`} inert={!isCartOpen} aria-hidden={!isCartOpen}>
      {/* Scrim Overlay (§2: --color-overlay) */}
      <div
        className="rv-cart-scrim"
        onClick={closeCart}
      />

      {/* Drawer Panel (§12: Cart drawer on paper) */}
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="rv-cart-panel"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-line)] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-2xl text-[var(--color-ink)] font-normal">
              Your Bag
            </h2>
            <span className="text-xs text-[var(--color-muted)] font-body">
              ({cartCount} {cartCount === 1 ? 'piece' : 'pieces'})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[var(--color-ink)] hover:text-[var(--color-clay)] transition-colors rounded-full"
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (§12: only when real threshold exists) */}
        <div className="px-5 py-3 bg-[var(--color-cream)] border-b border-[var(--color-line)]">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            {subtotal >= SHIPPING_THRESHOLD ? (
              <span className="text-[var(--color-success)] font-semibold flex items-center gap-1">
                <Check size={14} />
                <span>Complimentary insured shipping unlocked</span>
              </span>
            ) : (
              <span className="text-[var(--color-ink)]">
                Add <strong className="text-[var(--color-clay)]">₹{diffToFreeShipping.toLocaleString('en-IN')}</strong> for complimentary delivery
              </span>
            )}
            <span className="text-[var(--color-muted)] font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-sand)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-clay)] transition-transform duration-500"
              style={{ transform: `scaleX(${progressPercent / 100})`, transformOrigin: 'left' }}
            />
          </div>
        </div>

        {/* Line Items List (§12) */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[var(--color-line)]">
          {cart.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <p className="font-display text-2xl text-[var(--color-ink)] mb-2 font-normal">
                Your bag is empty
              </p>
              <p className="text-xs text-[var(--color-muted)] max-w-xs mb-6">
                Discover pieces handwoven on charkhas with organic dyes from our Bardoli atelier.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  navigate({ page: 'shop' });
                }}
                className="btn-primary btn-sm"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.key} className="py-4 first:pt-0 flex gap-4">
                {/* 3:4 Aspect Image */}
                <div className="w-20 aspect-[3/4] shrink-0 bg-[var(--color-sand)] overflow-hidden rounded-[4px]">
                  <img
                    src={item.image || '/images/hero-home.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-[var(--color-ink)] truncate">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.key)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Size: <strong className="text-[var(--color-ink)]">{item.size}</strong>
                      {item.size === 'Custom' && ' (Bespoke Tailoring)'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-1">
                    {/* Stepper */}
                    <div className="inline-flex items-center h-8 border border-[var(--color-line)] rounded-full bg-[var(--color-paper)] px-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, -1)}
                        className="w-6 h-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="price-tabular w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, 1)}
                        className="w-6 h-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line Price (Tabular Numbers) */}
                    <span className="price-tabular text-sm font-semibold text-[var(--color-ink)]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area & Checkout Button (§12) */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[var(--color-line)] bg-[var(--color-paper)] space-y-4">
            {/* Promo Code Input (§12) */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-3 text-[var(--color-muted)]" />
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  aria-label="Promo code"
                  placeholder="Promo code"
                  className="input-base h-9 pl-9 text-xs uppercase"
                />
              </div>
              {couponCode ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="btn-secondary btn-sm h-9 px-3 text-xs text-[var(--color-error)]"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={couponLoading || !inputCoupon.trim()}
                  className="btn-secondary btn-sm h-9 px-4 text-xs"
                >
                  {couponLoading ? 'Applying…' : 'Apply'}
                </button>
              )}
            </form>

            {/* Calculations Row */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--color-muted)]">
                <span>Bag Subtotal</span>
                <span className="price-tabular text-[var(--color-ink)] font-semibold">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[var(--color-success)] font-medium">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="price-tabular">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-muted)]">
                <span>Shipping</span>
                <span>{subtotal >= SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}</span>
              </div>
              <div className="border-t border-[var(--color-line)] pt-2 flex justify-between text-base font-semibold text-[var(--color-ink)]">
                <span>Estimated Total</span>
                <span className="price-tabular text-lg">
                  ₹{Math.max(0, subtotal - couponDiscount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <button
              type="button"
              onClick={() => {
                closeCart();
                navigate({ page: 'checkout' });
              }}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <p className="text-[11px] text-[var(--color-muted)] text-center">
              Free insured delivery · 7-day atelier returns · GST invoice
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
