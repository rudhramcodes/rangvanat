import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useStore } from '../context/store.js';

export default function ProductCard({
  product,
  onSelect,
}) {
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const [showSizePicker, setShowSizePicker] = useState(false);

  if (!product) return null;

  const id = product._id || product.slug;
  const slug = product.slug || id;
  const title = product.title || 'Handcrafted Khadi Piece';
  const price = product.price || 0;
  const compareAtPrice = product.compareAtPrice || null;
  const images = product.images || [];
  const primaryImage = images[0]?.url || product.image || '/images/hero-home.jpg';
  const secondaryImage = images[1]?.url || primaryImage;
  const category = product.category || product.fabric || 'Khadi Craft';
  const inWishlist = isInWishlist(slug) || isInWishlist(id);

  // Badge logic (§9: at most one badge per card, only when true)
  let badge = null;
  if (compareAtPrice && compareAtPrice > price) {
    badge = { text: 'Sale', bg: 'bg-[var(--color-sale)] text-[var(--color-white)]' };
  } else if (product.madeToOrder) {
    badge = { text: 'Made to Order', bg: 'bg-[var(--color-cream)] text-[var(--color-ink)]' };
  } else if (product.totalStock > 0 && product.totalStock <= 3) {
    badge = { text: `Only ${product.totalStock} left`, bg: 'bg-[var(--color-cream)] text-[var(--color-warning)]' };
  } else if (product.isFeatured) {
    badge = { text: 'Bestseller', bg: 'bg-[var(--color-ink)] text-[var(--color-paper)]' };
  }

  const handleQuickAdd = (e, size) => {
    e.stopPropagation();
    addToCart(product, size, 1);
    setShowSizePicker(false);
  };

  return (
    <div
      className="rv-product-card group relative flex flex-col text-left"
    >
      <a href={`/?page=product&id=${encodeURIComponent(slug)}`} className="product-hit-area" aria-label={`View ${title}`} onClick={e => { e.preventDefault(); onSelect?.(slug); }} />
      {/* Product image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-[var(--color-sand)]">
        <img
          src={primaryImage}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.03] ${
            images.length > 1 ? 'md:group-hover:opacity-0' : ''
          }`}
          loading="lazy"
        />

        {/* Desktop Second Image Hover Swap (§6) */}
        {images.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${title} alternate`}
            className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}

        {/* Badge (Top-Left) (§9) */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-[2px] ${badge.bg}`}>
              {badge.text}
            </span>
          </div>
        )}

        {/* Wishlist Heart (Top-Right) (§9) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(slug);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 z-10 ${
            inWishlist
              ? 'bg-[var(--color-white)] text-[var(--color-sale)]'
              : 'bg-[var(--color-white)]/90 text-[var(--color-ink)] hover:bg-[var(--color-white)]'
          }`}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.75} />
        </button>

        {/* Quick Add Bar on Desktop Hover (§9: never adds silently, opens sizes) */}
        <div
          className={`product-quick-add ${showSizePicker ? 'is-selecting' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {showSizePicker ? (
            <div className="product-size-picker">
              <span className="text-xs font-medium text-[var(--color-muted)] w-full text-center">
                Select size
              </span>
              {product.variants?.map((v) => (
                <button
                  key={v.size}
                  type="button"
                  disabled={!product.madeToOrder && v.stock <= 0}
                  onClick={(e) => handleQuickAdd(e, v.size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-[4px] border transition-colors ${
                    !product.madeToOrder && v.stock <= 0
                      ? 'border-[var(--color-line)] text-[var(--color-line)] line-through cursor-not-allowed'
                      : 'border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-white)]'
                  }`}
                >
                  {v.size}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowSizePicker(false)}
                className="text-xs text-[var(--color-muted)] underline mt-1 block w-full text-center hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => product.variants?.length ? setShowSizePicker(true) : onSelect?.(slug)}
              className="product-quick-button"
            >
              <Plus size={14} />
              <span>Quick add</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Details (§9) */}
      <div className="pt-3 flex flex-col gap-0.5">
        <h3 className="font-body text-base font-medium text-[var(--color-ink)] line-clamp-1 group-hover:text-[var(--color-clay)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] capitalize">
          {category}
        </p>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="price-tabular text-base font-semibold text-[var(--color-ink)]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="price-tabular text-sm text-[var(--color-muted)] line-through">
              ₹{compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
