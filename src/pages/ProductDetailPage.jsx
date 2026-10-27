import { useState, useEffect, useRef } from 'react';
import { Heart, Plus, Minus, AlertCircle, ChevronDown, ChevronUp, Truck, Ruler } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { useStore } from '../context/store.js';

export default function ProductDetailPage({ productId, navigate }) {
  const { addToCart, toggleWishlist, isInWishlist, addToast } = useStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loadedProductId, setLoadedProductId] = useState(null);

  // Custom Bespoke Measurements
  const [customBust, setCustomBust] = useState('');
  const [customWaist, setCustomWaist] = useState('');
  const [customHip, setCustomHip] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Pincode Checker
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState('details');

  const sizeSelectorRef = useRef(null);

  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api
      .getProductByIdOrSlug(productId)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        if (data?.variants?.length) {
          const firstAvailable = data.variants.find((v) => data.madeToOrder || v.stock > 0);
          setSelectedSize(firstAvailable ? firstAvailable.size : data.variants[0].size);
        } else {
          setSelectedSize('');
        }
        setLoadedProductId(productId);
      })
      .catch(() => {
        if (!active) return;
        setProduct(null);
        setLoadedProductId(productId);
      });

    api.getRelatedProducts(productId).then((data) => {
      if (active) setRelated(data || []);
    });

    return () => {
      active = false;
    };
  }, [productId]);

  const loading = loadedProductId !== productId;

  if (loading) {
    return (
      <div className="rv-container py-32 text-center text-sm text-[var(--color-muted)]">
        Opening atelier archives…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rv-container py-32 text-center">
        <h2 className="font-display text-3xl text-[var(--color-ink)] mb-4">Piece not found</h2>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          This piece may have been archived or returned to the atelier.
        </p>
        <button onClick={() => navigate({ page: 'shop' })} className="btn-primary btn-sm">
          Return to Catalog
        </button>
      </div>
    );
  }

  const id = product._id || product.slug;
  const slug = product.slug || id;
  const inWishlist = isInWishlist(slug) || isInWishlist(id);
  const images = product.images?.length > 0 ? product.images : [{ url: '/images/hero-home.jpg', alt: product.title }];
  const activeImage = images[selectedImageIndex] || images[0];

  // Stock truth (§1 & §10)
  const currentVariant = product.variants?.find((v) => v.size === selectedSize);
  const isOutOfStock = selectedSize && !product.madeToOrder && currentVariant && currentVariant.stock <= 0;
  const isLowStock = selectedSize && !product.madeToOrder && currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 3;

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setDeliveryResult({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code' });
      return;
    }
    setPincodeLoading(true);
    try {
      const res = await api.checkDelivery(pincode.trim());
      setDeliveryResult(
        res?.success
          ? res.data
          : { serviceable: false, message: res?.message || 'We could not confirm delivery to this PIN code.' }
      );
    } catch {
      setDeliveryResult({ serviceable: false, message: 'Delivery check is temporarily unavailable. Please try again.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError(true);
      sizeSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addToast('Please choose a size to continue', 'error');
      return;
    }
    setSizeError(false);

    let bespokeData = null;
    if (selectedSize === 'Custom') {
      bespokeData = {
        bust: customBust,
        waist: customWaist,
        hip: customHip,
        height: customHeight,
        notes: customNotes,
      };
    }

    addToCart(product, selectedSize, quantity, bespokeData);
  };

  return (
    <div className="w-full bg-[var(--color-paper)] text-[var(--color-ink)] py-8 md:py-16">
      <div className="rv-container">
        {/* Breadcrumb (§10) */}
        <nav className="text-xs text-[var(--color-muted)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--color-ink)]">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate({ page: 'shop' })} className="hover:text-[var(--color-ink)]">
            Catalog
          </button>
          <span>/</span>
          <button
            onClick={() => navigate({ page: 'shop', collection: product.collectionId })}
            className="hover:text-[var(--color-ink)] capitalize"
          >
            {product.collectionId}
          </button>
          <span>/</span>
          <span className="text-[var(--color-ink)] font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Two-Column Grid: Gallery Left + Sticky Buy Panel Right (§10) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Gallery (§10) */}
          <div className="product-gallery lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main High-Res Image (3:4 ratio) */}
            <div className="product-gallery-image relative aspect-[3/4] flex-1 overflow-hidden rounded-[4px] bg-[var(--color-sand)] border border-[var(--color-line)] shadow-sm">
              <img
                key={activeImage.url}
                src={activeImage.url}
                alt={activeImage.alt || product.title}
                className="w-full h-full object-cover transition-transform duration-300 ease-out"
              />
              {/* Subtle Tag Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {product.madeToOrder && (
                  <span className="bg-[var(--color-paper)] text-[var(--color-ink)] px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-[2px] shadow-sm">
                    Made to Order
                  </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="bg-[var(--color-sale)] text-[var(--color-white)] px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-[2px] shadow-sm">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip (§10: tapping a thumbnail swaps main image) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible shrink-0 pb-2 md:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    type="button"
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={selectedImageIndex === idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-20 md:w-20 md:h-26 rounded-[4px] overflow-hidden bg-[var(--color-sand)] border transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[var(--color-ink)] ring-1 ring-[var(--color-ink)]'
                        : 'border-[var(--color-line)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || `Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Buy Panel (§10) */}
          <div className="purchase-panel lg:col-span-5 sticky top-24 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[var(--color-clay)] uppercase">
                {product.fabric || 'Pure Khadi'} · {product.craft || 'Handloom'}
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-[var(--color-ink)] mt-1 font-normal leading-tight">
                {product.title}
              </h1>

              {/* Price row (§10: Price row with compare price only for a real discount) */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="price-tabular text-2xl font-semibold text-[var(--color-ink)]">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="price-tabular text-base text-[var(--color-muted)] line-through">
                    ₹{product.compareAtPrice?.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-[var(--color-muted)]">Includes all taxes</span>
              </div>
            </div>

            {/* Short Editorial Description */}
            <p className="text-sm text-[var(--color-muted)] font-body leading-relaxed">
              {product.description}
            </p>

            <div className="border-t border-[var(--color-line)] pt-5" />

            {/* Size Selector Matrix (§10 & §2: XS to XXL + Custom) */}
            <div ref={sizeSelectorRef} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                  Select Size <span className="text-[var(--color-clay)]">*</span>
                </label>
                {selectedSize && (
                  <span className="text-xs font-medium text-[var(--color-clay)]">
                    Selected: {selectedSize}
                  </span>
                )}
              </div>

              {sizeError && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-error)] font-medium animate-shake">
                  <AlertCircle size={14} />
                  <span>Please choose a size before adding to bag</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2.5">
                {product.variants?.map((v) => {
                  const outOfStock = !product.madeToOrder && v.stock <= 0;
                  const isSelected = selectedSize === v.size;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSize(v.size);
                        setSizeError(false);
                      }}
                      className={`h-11 px-4 text-xs font-semibold rounded-[6px] border transition-all flex items-center justify-center gap-1 ${
                        outOfStock
                          ? 'border-[var(--color-line)] text-[var(--color-muted)] line-through bg-[var(--color-cream)]/50 cursor-not-allowed'
                          : isSelected
                          ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)] shadow-sm'
                          : 'border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:border-[var(--color-ink)]'
                      }`}
                    >
                      <span>{v.size}</span>
                      {v.priceDelta > 0 && <span className="text-[10px] opacity-80">(+₹{v.priceDelta})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Stock Truth Notice (§1 & §10) */}
              {isLowStock && (
                <p className="text-xs font-medium text-[var(--color-warning)] pt-1">
                  • Only {currentVariant.stock} pieces left in atelier inventory
                </p>
              )}
              {isOutOfStock && (
                <p className="text-xs font-medium text-[var(--color-error)] pt-1">
                  • This size is currently sold out
                </p>
              )}
            </div>

            {/* Custom Bespoke Measurements Input Drawer */}
            {selectedSize === 'Custom' && (
              <div className="p-4 bg-[var(--color-cream)] border border-[var(--color-line)] rounded-[8px] space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)] uppercase">
                  <Ruler size={16} className="text-[var(--color-clay)]" />
                  <span>Bespoke Custom Measurements (Inches)</span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Provide your exact tailor measurements. Our master pattern cutter will tailor this garment specifically for your frame.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-[var(--color-muted)] block mb-1">Bust / Chest (in)</label>
                    <input
                      type="text"
                      value={customBust}
                      onChange={(e) => setCustomBust(e.target.value)}
                      placeholder="e.g. 36"
                      className="input-base h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--color-muted)] block mb-1">Waist (in)</label>
                    <input
                      type="text"
                      value={customWaist}
                      onChange={(e) => setCustomWaist(e.target.value)}
                      placeholder="e.g. 30"
                      className="input-base h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--color-muted)] block mb-1">Hip (in)</label>
                    <input
                      type="text"
                      value={customHip}
                      onChange={(e) => setCustomHip(e.target.value)}
                      placeholder="e.g. 38"
                      className="input-base h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--color-muted)] block mb-1">Total Height</label>
                    <input
                      type="text"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="e.g. 5ft 6in"
                      className="input-base h-9 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[var(--color-muted)] block mb-1">Special Tailoring Notes (Optional)</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Prefer relaxed sleeve length, higher neckline"
                    className="input-base h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Quantity Stepper & Actions (§10 & §8) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center border border-[var(--color-line)] rounded-full bg-[var(--color-paper)] h-12 px-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="price-tabular w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Primary Add to Bag Pill Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToBag}
                  className="btn-primary flex-1 h-12"
                >
                  {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(slug)}
                  className={`w-12 h-12 rounded-full border border-[var(--color-line)] flex items-center justify-center transition-colors ${
                    inWishlist ? 'text-[var(--color-sale)] bg-[var(--color-white)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-cream)]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Pincode Delivery Serviceability Check (§10) */}
            <div className="p-4 bg-[var(--color-cream)]/60 border border-[var(--color-line)] rounded-[8px] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                <Truck size={16} className="text-[var(--color-clay)]" />
                <span>Delivery Serviceability Check</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="input-base text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="btn-secondary shrink-0"
                >
                  {pincodeLoading ? 'Checking…' : 'Check'}
                </button>
              </form>
              {deliveryResult && (
                <p className={`text-xs ${deliveryResult.serviceable ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                  {deliveryResult.message || `Delivery estimated in ${deliveryResult.estimatedDays || 5} business days.`}
                </p>
              )}
            </div>

            {/* Accordion Tabs (§10: Details, Fabric & Care, Shipping, Returns) */}
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] pt-2 text-sm">
              {/* Accordion 1: Craft & Artisan Story */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === 'story' ? '' : 'story'))}
                  className="w-full flex items-center justify-between text-left font-semibold text-[var(--color-ink)]"
                >
                  <span>Artisan &amp; Handloom Heritage</span>
                  {openAccordion === 'story' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'story' && (
                  <div className="mt-2 text-xs text-[var(--color-muted)] leading-relaxed font-body animate-fade-in">
                    {product.heritageCraftStory || 'Woven on pit looms by master artisans in Bardoli, Gujarat. Each thread is spun on amber charkhas preserving centuries of pure Gandhian handloom tradition.'}
                  </div>
                )}
              </div>

              {/* Accordion 2: Fabric & Care */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === 'care' ? '' : 'care'))}
                  className="w-full flex items-center justify-between text-left font-semibold text-[var(--color-ink)]"
                >
                  <span>Fabric &amp; Wash Care</span>
                  {openAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'care' && (
                  <div className="mt-2 text-xs text-[var(--color-muted)] leading-relaxed font-body animate-fade-in space-y-1">
                    <p>• <strong>Fabric:</strong> {product.fabric || '100% Organic Handspun Khadi Cotton'}</p>
                    <p>• <strong>Care:</strong> {product.washCare || 'Dry clean recommended. Or hand-wash in cold water with gentle reetha liquid. Do not wring or bleach. Dry inside out in shade.'}</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion((prev) => (prev === 'shipping' ? '' : 'shipping'))}
                  className="w-full flex items-center justify-between text-left font-semibold text-[var(--color-ink)]"
                >
                  <span>Complimentary Shipping &amp; Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="mt-2 text-xs text-[var(--color-muted)] leading-relaxed font-body animate-fade-in space-y-1">
                    <p>• Complimentary insured delivery on orders above ₹5,000 across India.</p>
                    <p>• Standard courier timeline: 5–7 business days. Made-to-order pieces require 10–14 days of weaving time.</p>
                    <p>• 7-day atelier exchange policy for size adjustments or defects.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look / Related Pieces (§10: 4 related products max) */}
        {related.length > 0 && (
          <section className="mt-20 pt-16 border-t border-[var(--color-line)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold tracking-widest text-[var(--color-clay)] uppercase">
                  Complete The Look
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-[var(--color-ink)] font-normal mt-1">
                  Pieces from the same edit
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.slice(0, 4).map((rel) => (
                <ProductCard
                  key={rel._id}
                  product={rel}
                  onSelect={(slug) => navigate({ page: 'product', id: slug })}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
