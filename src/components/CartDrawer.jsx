import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function CartDrawer({ navigate }) {
  const {
    cart,
    cartCount,
    subtotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    formatPrice,
  } = useStore();

  const SHIPPING_THRESHOLD = 15000;
  const progressPercent = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
  const diffToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <>
      {/* Backdrop Scrim */}
      <div
        className={`drawer-backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside
        className={`cart-drawer-panel ${isCartOpen ? 'open' : ''}`}
        aria-labelledby="cart-drawer-title"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[var(--line-khadi)] flex items-center justify-between">
          <h2 id="cart-drawer-title" className="heading-3 text-[var(--ink-chocolate)] m-0">
            Your Bag ({cartCount})
          </h2>
          <button
            onClick={closeCart}
            className="icon-btn text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
            aria-label="Close Bag"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3.5 bg-[var(--bg-cream)]/70 border-b border-[var(--line-khadi)]">
          <p className="caption text-[var(--ink-chocolate)] font-medium mb-1.5 flex items-center justify-between">
            {subtotal >= SHIPPING_THRESHOLD ? (
              <span className="text-[var(--state-success)] font-semibold">
                ✓ You qualify for complimentary domestic shipping
              </span>
            ) : (
              <span>
                Add <strong className="text-[var(--brand-maroon)]">{formatPrice(diffToFreeShipping)}</strong> more for complimentary shipping
              </span>
            )}
            <span className="text-[var(--brand-gold)] font-bold">{progressPercent}%</span>
          </p>
          <div className="free-shipping-track">
            <div
              className="free-shipping-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Line Items List */}
        <div className="flex-grow overflow-y-auto p-5 divide-y divide-[var(--line-khadi)]">
          {cart.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <p className="serif-statement text-xl text-[var(--ink-chocolate)] mb-4">
                "Your bag is empty, the loom is not."
              </p>
              <p className="body-s max-w-xs mb-6 text-[var(--ink-soft)]">
                Discover pieces handwoven with organic dyes and hand-spun thread from our artisans.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate({ page: 'shop' });
                }}
                className="btn btn-primary btn-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.key} className="py-4 first:pt-0 flex gap-4">
                {/* 80x100 Thumbnail */}
                <div className="w-20 h-25 flex-shrink-0 bg-[var(--bg-cream)] overflow-hidden rounded-[0px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[14.5px] font-medium text-[var(--ink-chocolate)] line-clamp-1">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-[var(--ink-soft)] hover:text-[var(--state-error)] transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="caption text-[var(--ink-soft)] mt-0.5">
                      Size: <strong className="text-[var(--ink-chocolate)]">{item.size}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="inline-flex items-center h-8 border border-[var(--line-khadi)] rounded-[2px] bg-white">
                      <button
                        onClick={() => updateQuantity(item.key, -1)}
                        className="w-7 h-full flex items-center justify-center hover:bg-[var(--bg-cream)] text-[var(--ink-chocolate)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold border-l border-r border-[var(--line-khadi)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, 1)}
                        className="w-7 h-full flex items-center justify-center hover:bg-[var(--bg-cream)] text-[var(--ink-chocolate)]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="price text-[15px]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[var(--line-khadi)] bg-white space-y-3">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-[var(--ink-chocolate)]">Subtotal</span>
              <span className="price text-xl font-bold">{formatPrice(subtotal)}</span>
            </div>

            <p className="caption text-[var(--ink-soft)]">
              Shipping & taxes calculated at checkout. Complimentary returns within 7 days.
            </p>

            <button
              onClick={() => {
                closeCart();
                navigate({ page: 'checkout' });
              }}
              className="btn btn-primary btn-lg w-full justify-center text-[15px] tracking-wider"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="text-center">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Namaste Rangvanat, I would like to enquire about my bag with ${cartCount} handcrafted pieces totaling ${formatPrice(subtotal)}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs text-[var(--ink-soft)] hover:text-[var(--brand-maroon)]"
              >
                or Enquire about this bag on WhatsApp ↗
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
