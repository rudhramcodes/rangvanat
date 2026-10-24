import { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';

export default function ProductDetailPage({ productId, navigate }) {
  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('fabric');
  const [loading, setLoading] = useState(true);

  // Custom Measurements state if 'Custom' is selected
  const [customBust, setCustomBust] = useState('');
  const [customWaist, setCustomWaist] = useState('');
  const [customHip, setCustomHip] = useState('');

  // Hover zoom lens coordinates
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);
  const buyPanelRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.getProductByIdOrSlug(productId).then((data) => {
      setProduct(data);
      if (data?.variants?.length) {
        setSelectedSize(data.variants[0].size || 'M');
      }
      setLoading(false);
    });

    api.getRelatedProducts(productId).then((data) => setRelated(data || []));
  }, [productId]);

  // Track scroll for sticky bottom buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (buyPanelRef.current) {
        const rect = buyPanelRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  if (loading) {
    return (
      <div className="rv-container py-24 text-center">
        <p className="caption text-[var(--ink-soft)] animate-pulse">Unfolding piece from the atelier...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rv-container py-24 text-center">
        <h2 className="heading-2 text-[var(--brand-maroon)]">Piece Not Found</h2>
        <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-md mt-4">
          Browse Lookbook
        </button>
      </div>
    );
  }

  const id = product._id || product.id || product.slug;
  const title = product.title || product.name || 'Handcrafted Khadi Piece';
  const price = product.price || 12500;
  const compareAtPrice = product.compareAtPrice || null;
  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : [product.image || '/images/hero.png', '/images/heritage-detail.jpg', '/images/3.webp'];
  const inWishlist = isInWishlist(product.slug) || isInWishlist(id);

  const availableSizes = product.variants?.length
    ? product.variants.map((v) => v.size)
    : ['XS', 'S', 'M', 'L', 'XL', 'Custom'];

  const handleAdd = () => {
    const customMeasurements =
      selectedSize === 'Custom' ? { bust: customBust, waist: customWaist, hip: customHip } : {};
    addToCart(product, selectedSize, quantity, customMeasurements);
  };

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-8 md:py-12">
      <div className="rv-container">
        {/* Breadcrumbs (§12) */}
        <nav className="caption text-[var(--ink-soft)] mb-8 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <button onClick={() => navigate({ page: 'shop' })} className="hover:text-[var(--brand-maroon)]">
            Shop
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold truncate max-w-xs">{title}</span>
        </nav>

        {/* 55/45 Two Columns Grid (§12.3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          {/* Left Column (55% = 7 Cols): Gallery with Zoom */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails Row (Desktop vertical 72px, Mobile horizontal) */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-24 md:w-20 md:h-26 flex-shrink-0 bg-[var(--bg-cream)] overflow-hidden rounded-[0px] border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[var(--brand-maroon)] ring-1 ring-[var(--brand-maroon)]'
                      : 'border-[var(--line-khadi)] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`${title} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage (3:4 ratio with Cursor Zoom Lens) */}
            <div
              className="flex-grow relative aspect-[3/4] bg-[var(--bg-cream)] overflow-hidden cursor-crosshair rounded-[0px]"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => {
                setIsZooming(false);
                setZoomStyle({});
              }}
              onMouseMove={handleMouseMove}
            >
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={title}
                style={isZooming ? zoomStyle : {}}
                className="w-full h-full object-cover transition-transform duration-200 ease-out"
              />

              {/* Wishlist Button Overlay */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`wishlist-heart-btn absolute top-4 right-4 ${inWishlist ? 'active' : ''}`}
                aria-label="Save to Wishlist"
              >
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  fill={inWishlist ? 'var(--brand-maroon)' : 'none'}
                />
              </button>
            </div>
          </div>

          {/* Right Column (45% = 5 Cols): Buy Panel */}
          <div ref={buyPanelRef} className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <p className="eyebrow text-[var(--brand-gold)] mb-1">
                {product.collectionId ? `The ${product.collectionId.toUpperCase()} Edit` : 'Bardoli Atelier'}
              </p>
              <h1 className="heading-1 text-[var(--brand-maroon)] uppercase">{title}</h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="price text-2xl font-bold">{formatPrice(price)}</span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-base text-[var(--ink-soft)] line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
                <span className="caption text-[var(--ink-soft)] ml-2">(MRP inclusive of all taxes)</span>
              </div>

              {/* Fabric Specs */}
              <p className="caption text-[var(--brand-maroon)] font-semibold mt-2">
                {product.heritageCraftStory || '100% Handloom Khadi · Natural Botanical Dyes · Pit Loom Woven'}
              </p>
            </div>

            {/* Description (Expandable inline) */}
            <div className="text-[15px] text-[var(--ink-chocolate)]/90 leading-relaxed border-t border-b border-[var(--line-khadi)] py-4">
              <p className={descriptionExpanded ? '' : 'line-clamp-3'}>
                {product.description ||
                  'Meticulously hand-spun on wooden charkhas and woven on traditional pit looms in Bardoli. Every yarn breathes freely, providing exceptional natural thermal regulation and timeless drape.'}
              </p>
              <button
                type="button"
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="btn-ghost text-xs font-semibold text-[var(--brand-maroon)] mt-1"
              >
                {descriptionExpanded ? 'Read less ↑' : 'Read more ↓'}
              </button>
            </div>

            {/* Size Selector (Pill Buttons 44px height) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="caption uppercase font-semibold text-[var(--ink-chocolate)] tracking-wider">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'faq' })}
                  className="caption text-[var(--brand-maroon)] underline"
                >
                  Size Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 px-5 rounded-full text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-[var(--brand-maroon)] text-[var(--bg-ivory)] shadow-sm'
                        : 'bg-white border border-[var(--line-khadi)] text-[var(--ink-chocolate)] hover:border-[var(--brand-maroon)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* If Custom Size Selected, Show Bespoke Measurements Inputs */}
              {selectedSize === 'Custom' && (
                <div className="mt-4 p-4 bg-[var(--bg-cream)] border border-[var(--brand-gold)] rounded-[2px] space-y-3">
                  <p className="caption text-[var(--brand-maroon)] font-semibold">
                    ✦ Bespoke Tailoring Details (Inches)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Bust"
                      value={customBust}
                      onChange={(e) => setCustomBust(e.target.value)}
                      className="form-input h-9 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Waist"
                      value={customWaist}
                      onChange={(e) => setCustomWaist(e.target.value)}
                      className="form-input h-9 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Hip"
                      value={customHip}
                      onChange={(e) => setCustomHip(e.target.value)}
                      className="form-input h-9 text-xs"
                    />
                  </div>
                  <p className="caption text-xs text-[var(--ink-soft)]">
                    Our master tailor will confirm final specs over WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="caption uppercase font-semibold text-[var(--ink-chocolate)]">Quantity:</span>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Primary Add to Bag */}
              <button
                type="button"
                onClick={handleAdd}
                className="btn btn-primary btn-lg w-full justify-center tracking-widest text-base uppercase"
              >
                Add to Bag · {formatPrice(price * quantity)}
              </button>

              {/* Secondary WhatsApp Concierge */}
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Namaste Rangvanat, I would like to enquire about ordering ${title} in size ${selectedSize}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-md w-full justify-center text-sm font-semibold flex items-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges (§12.3) */}
            <div className="pt-4 border-t border-[var(--line-khadi)] grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <ShieldCheck size={20} className="text-[var(--brand-gold)] mb-1" />
                <span className="caption text-[11px] leading-tight text-[var(--ink-chocolate)] font-medium">
                  Handloom Certified
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Truck size={20} className="text-[var(--brand-gold)] mb-1" />
                <span className="caption text-[11px] leading-tight text-[var(--ink-chocolate)] font-medium">
                  Ships from Bardoli
                </span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw size={20} className="text-[var(--brand-gold)] mb-1" />
                <span className="caption text-[11px] leading-tight text-[var(--ink-chocolate)] font-medium">
                  7-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Bands Below (§12.3) */}
        <div className="mt-20 pt-10 border-t border-[var(--line-khadi)] space-y-12">
          {/* Collapsible Details & Care Tabs */}
          <div className="max-w-3xl mx-auto space-y-3">
            <h3 className="heading-2 text-[var(--brand-maroon)] text-center mb-6 uppercase">
              Atelier Notes & Care
            </h3>

            {[
              {
                id: 'fabric',
                title: 'Fabric & Material Origin',
                content:
                  '100% indigenous organic Desi cotton, hand-harvested in Gujarat and manually spun on amber charkhas. Absolutely no polyester or chemical sizing is used.',
              },
              {
                id: 'weave',
                title: 'The Weaving Process',
                content:
                  'Woven on traditional Bardoli wooden pit looms by master artisans. Subtle irregularities in yarn density and slubs are signatures of authentic human touch.',
              },
              {
                id: 'care',
                title: 'Wash & Preservation Care',
                content:
                  'Dry clean recommended for the first two washes to set authentic vegetable indigo and madder dyes. Subsequently, hand wash gently in cold water with mild organic shampoo. Line dry in shade.',
              },
              {
                id: 'shipping',
                title: 'Craft Dispatch & Shipping Timeline',
                content:
                  'Standard pieces dispatch within 3 business days. Bespoke and custom-sized garments require 7 to 10 days of artisan tailoring. Shipped via premium insured air courier.',
              },
            ].map((tab) => (
              <div key={tab.id} className="border border-[var(--line-khadi)] bg-white rounded-[2px]">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === tab.id ? '' : tab.id))}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-[15px] text-[var(--ink-chocolate)]"
                >
                  <span>{tab.title}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      openAccordion === tab.id ? 'rotate-180 text-[var(--brand-maroon)]' : ''
                    }`}
                  />
                </button>
                {openAccordion === tab.id && (
                  <div className="px-5 pb-5 text-[14px] text-[var(--ink-chocolate)]/85 leading-relaxed border-t border-[var(--line-khadi)]/50 pt-3">
                    {tab.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* The Hands Behind It Banner (§12.3) */}
          <div className="bg-[var(--bg-tan)] p-8 md:p-12 rounded-[2px] flex flex-col md:flex-row items-center gap-8">
            <img
              src="/images/artisan1.jpg"
              alt="Master Weaver"
              className="w-36 h-36 md:w-44 md:h-44 rounded-[0px] object-cover flex-shrink-0"
            />
            <div className="space-y-3">
              <p className="eyebrow text-[var(--brand-maroon)]">The Hands Behind the Piece</p>
              <h4 className="heading-2 text-[var(--ink-chocolate)] text-xl">
                Loomed by Kantaben & Family · Bardoli Village Cluster
              </h4>
              <p className="body-l text-[var(--ink-chocolate)]/90 italic">
                "When I throw the shuttle, I pray that the person who wears this cloth feels the warmth of our loom and our blessings."
              </p>
              <button
                type="button"
                onClick={() => navigate({ page: 'craft' })}
                className="btn-ghost text-xs text-[var(--brand-maroon)] font-bold uppercase tracking-wider"
              >
                Learn more about our artisan collective →
              </button>
            </div>
          </div>

          {/* You May Also Like (§12.3) */}
          {related.length > 0 && (
            <div className="pt-8">
              <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[var(--line-khadi)]">
                <h3 className="heading-1 text-[var(--brand-maroon)] uppercase">You May Also Like</h3>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="btn-ghost text-[14px] font-semibold text-[var(--brand-maroon)]"
                >
                  View entire collection →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.slice(0, 4).map((item) => (
                  <ProductCard
                    key={item._id || item.slug}
                    product={item}
                    variant="grid"
                    onSelect={(newId) => navigate({ page: 'product', id: newId })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Buy Bar (Shown when scrolled past main panel) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--line-khadi)] shadow-lg py-3 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={images[0]} alt={title} className="w-10 h-12 object-cover rounded-[0px]" />
            <div>
              <p className="font-semibold text-sm text-[var(--ink-chocolate)] truncate max-w-xs">{title}</p>
              <span className="price text-sm">{formatPrice(price)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary btn-sm px-6 text-xs uppercase tracking-wider"
          >
            Add to Bag
          </button>
        </div>
      )}
    </main>
  );
}
