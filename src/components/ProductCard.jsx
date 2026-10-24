import { Heart } from 'lucide-react';
import { useStore } from '../context/store.js';

export default function ProductCard({
  product,
  variant = 'grid', // 'grid' | 'editorial'
  onSelect,
}) {
  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useStore();

  const id = product._id || product.id || product.slug;
  const title = product.title || product.name || 'Handcrafted Khadi Piece';
  const slug = product.slug || product.id || 'piece';
  const price = product.price;
  const compareAtPrice = product.compareAtPrice || null;
  const image =
    product.images?.[0]?.url ||
    product.image ||
    null;
  const category = product.category || 'Handloom Garment';
  const craftSpecs = product.heritageCraftStory || product.specs?.join(' • ') || 'Hand Spun • Bardoli Khadi';
  const defaultSize = product.variants?.find(v=>product.madeToOrder||v.stock>0)?.size || 'Standard';

  const inWishlist = isInWishlist(slug) || isInWishlist(id);

  // Badge logic
  let badge = null;
  if (product.isFeatured) badge = { text: 'Bestseller', class: 'badge-bestseller' };
  else if (product.totalStock && product.totalStock <= 5) badge = { text: 'Last pieces', class: 'badge-last' };
  else if (product.isNewArrival) badge = { text: 'New', class: 'badge-new' };

  if (variant === 'editorial') {
    return (
      <div
        className="group relative cursor-pointer flex flex-col"
        onClick={() => onSelect?.(slug || id)}
      >
        <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-[var(--bg-cream)] rounded-[0px]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Photographic Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
            <p className="serif-statement text-white/95 text-lg md:text-2xl drop-shadow-sm mb-2">
              "{product.description ? product.description.slice(0, 90) + '...' : 'Crafted with stories woven into thread.'}"
            </p>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[var(--brand-gold-soft)]">{category}</span>
              <span className="btn-ghost text-white text-[13px] font-medium underline">
                Discover Piece →
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-baseline justify-between">
          <h3 className="heading-2 text-[var(--brand-maroon)] text-xl md:text-2xl font-semibold uppercase">
            {title}
          </h3>
          <span className="price text-lg font-bold">{formatPrice(price)}</span>
        </div>
      </div>
    );
  }

  // Default Grid Card
  return (
    <div className="product-card group flex flex-col select-none">
      {/* 3:4 Image Frame */}
      <div
        className="product-image-wrap cursor-pointer"
        onClick={() => onSelect?.(slug || id)}
      >
        <img
          src={image || '/images/hero.png'}
          alt={title}
          loading="lazy"
          className="transition-transform duration-600"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/hero.png';
          }}
        />

        {/* Badge */}
        {badge && <span className={`badge-pill ${badge.class}`}>{badge.text}</span>}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`wishlist-heart-btn ${inWishlist ? 'active' : ''}`}
          aria-label="Save to Wishlist"
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={inWishlist ? 'var(--brand-maroon)' : 'none'}
          />
        </button>

        {/* Quick Add Bar (Desktop Hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, defaultSize, 1);
          }}
          className="quick-add-bar"
        >
          Add to Bag
        </button>
      </div>

      {/* Meta Content */}
      <div className="pt-3 flex flex-col flex-grow">
        <h3
          onClick={() => onSelect?.(slug || id)}
          className="text-[15.5px] font-medium text-[var(--ink-chocolate)] leading-snug line-clamp-2 hover:text-[var(--brand-maroon)] cursor-pointer transition-colors"
        >
          {title}
        </h3>

        <p className="caption text-[var(--ink-soft)] mt-1 line-clamp-1">{craftSpecs}</p>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="price">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="caption text-[var(--ink-soft)] line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Direct E-commerce Actions */}
        <div className="mt-2.5 pt-2 border-t border-[var(--line-khadi)]/50 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(slug || id);
            }}
            className="text-xs text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] font-medium"
          >
            View Details →
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, defaultSize, 1);
            }}
            className="text-xs font-semibold text-[var(--brand-maroon)] bg-[var(--brand-maroon-tint)] hover:bg-[var(--brand-maroon)] hover:text-white transition-colors px-3 py-1 rounded-full"
          >
            + Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
