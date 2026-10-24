import { useState, useEffect } from 'react';
import { ArrowDown, Disc, Droplets, Grid, Layers, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';

const InstagramIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function HomePage({ navigate }) {
  const { addToast } = useStore();
  const [collections, setCollections] = useState([]);
  const [selectedEdit, setSelectedEdit] = useState('all');
  const [bestsellers, setBestsellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [curatedLoading, setCuratedLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'editorial'
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Initial load: Collections and Bestsellers
  useEffect(() => {
    async function loadInitial() {
      try {
        const [colls, bests] = await Promise.all([
          api.getCollections(),
          api.getBestsellers(),
        ]);
        setCollections(colls || []);
        setBestsellers(bests || []);
      } catch (e) {
        console.error('Failed to load initial home data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Dynamically load Curated Edits products based on selected tab
  useEffect(() => {
    async function loadCurated() {
      setCuratedLoading(true);
      try {
        if (selectedEdit === 'all') {
          // Fetch featured products
          const feat = await api.getFeaturedProducts();
          let items = feat || [];
          // If fewer than 3 items, fill up from published products so layout is always full
          if (items.length < 3) {
            const extra = await api.getProducts({ limit: 4 });
            const extraItems = (extra?.products || []).filter(
              (p) => !items.some((existing) => (existing._id || existing.slug) === (p._id || p.slug))
            );
            items = [...items, ...extraItems].slice(0, 3);
          }
          setFeaturedProducts(items);
        } else {
          // Fetch specifically for the chosen collection
          const data = await api.getProducts({ collection: selectedEdit, limit: 3 });
          setFeaturedProducts(data?.products || []);
        }
      } catch (err) {
        console.error('Failed to load curated products:', err);
      } finally {
        setCuratedLoading(false);
      }
    }
    loadCurated();
  }, [selectedEdit]);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    await api.subscribeNewsletter(newsletterEmail);
    addToast('Subscribed to Letters from the Loom!', 'success');
    setNewsletterEmail('');
  };

  return (
    <main id="main-content" className="flex flex-col w-full">
      {/* 1. HERO SECTION (§12.1 Item 1) */}
      <section className="relative w-full min-h-[calc(100vh-108px)] flex items-center bg-[#120805] overflow-hidden">
        {/* Background Video with Poster Fallback */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/hero.png"
            className="w-full h-full object-cover opacity-100"
          >
            <source
              src="https://res.cloudinary.com/dvsrgdyi7/video/upload/rangvanat-hero.mp4"
              type="video/mp4"
            />
          </video>

          {/* Lightweight Clean Scrim: Soft, subtle darkening on left only so the video shines through naturally */}
          <div
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              background:
                'linear-gradient(90deg, rgba(10, 5, 3, 0.58) 0%, rgba(10, 5, 3, 0.35) 45%, rgba(10, 5, 3, 0.08) 80%, transparent 100%)',
            }}
          />
          {/* Mobile Scrim */}
          <div
            className="absolute inset-0 pointer-events-none md:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(10, 5, 3, 0.25) 0%, rgba(10, 5, 3, 0.65) 100%)',
            }}
          />
        </div>

        <div className="w-full relative z-10 px-6 sm:px-12 md:px-16 lg:px-24 py-16 sm:py-20 md:py-24 text-[var(--bg-ivory)]">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Eyebrow Label (No decorative line) */}
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-3 tracking-[0.25em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Handcrafted in Bardoli · Gujarat
            </p>

            {/* Architectural 2-Line Headline per Taste-Skill (No decorative line) */}
            <h1 className="display-xl font-bold tracking-tight text-[var(--bg-ivory)] mb-6 leading-[0.98] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              WEAVING COLOURS<br className="hidden sm:inline" /> INTO STORIES
            </h1>

            {/* Serif Pull Statement (Separated cleanly by space, no thin line) */}
            <p className="serif-statement text-xl sm:text-2xl md:text-[25px] text-[var(--bg-ivory)]/95 mb-8 max-w-xl font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              "Cloth whose thread is spun by hand, dyed with ancient roots, and woven into quiet poetry."
            </p>

            {/* Two Action Buttons: Both 52px height, pristine alignment */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <button
                onClick={() => navigate({ page: 'shop' })}
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all"
              >
                Shop the Collection
              </button>
              <button
                onClick={() => navigate({ page: 'story' })}
                className="h-[52px] px-8 rounded-[2px] bg-white/10 backdrop-blur-sm border border-white/35 text-[var(--bg-ivory)] hover:border-white hover:bg-white/20 transition-all text-[14px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <span>Our Story</span>
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Centered at Screen Bottom: Animated Mouse Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-[var(--bg-ivory)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            <div className="w-[18px] h-[30px] rounded-full border-2 border-[var(--bg-ivory)]/85 flex items-start justify-center p-[3px]">
              <div className="w-[3px] h-[6px] rounded-full bg-[var(--brand-gold-soft)] animate-scroll-dot" />
            </div>
            <span
              className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ color: '#FFFFFF' }}
            >
              Scroll to Explore
            </span>
          </div>
        </div>
      </section>

      {/* 2. CRAFT STRIP (§12.1 Item 2) */}
      <section className="w-full bg-[var(--bg-tan)] py-14 border-y border-[var(--line-khadi)]">
        <div className="rv-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Disc,
                title: '1. Hand Spinning',
                desc: 'Raw indigenous organic cotton drawn on the amber charkha at sunrise.',
              },
              {
                icon: Droplets,
                title: '2. Natural Dyeing',
                desc: 'Fermented indigo vats, madder roots, and pomegranate rinds.',
              },
              {
                icon: Grid,
                title: '3. Pit Loom Weaving',
                desc: 'Foot-pedal wooden looms breathing rhythm into warp and weft.',
              },
              {
                icon: Layers,
                title: '4. Block Finishing',
                desc: 'Hand-carved teakwood blocks stamping heritage borders with neem gum.',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2.5">
                    <Icon size={22} className="text-[var(--brand-maroon)]" strokeWidth={1.5} />
                    <h3 className="heading-3 text-[17px] text-[var(--ink-chocolate)] font-semibold uppercase">
                      {step.title}
                    </h3>
                  </div>
                  <p className="body-s text-[var(--ink-chocolate)]/85 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CURATED EDITS (§12.1 Item 3 - Fully Dynamic Collection Showcase) */}
      <section className="rv-section bg-[var(--bg-ivory)]">
        <div className="rv-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[var(--line-khadi)]">
            <div>
              <p className="eyebrow text-[var(--brand-gold)] mb-1">Curated Seasons</p>
              <h2 className="heading-1 text-[var(--brand-maroon)]">Curated Edits</h2>
            </div>
            <button
              onClick={() => navigate({ page: 'shop', collection: selectedEdit })}
              className="btn-ghost text-[14px] font-semibold text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] self-start md:self-auto"
            >
              View all pieces in this edit →
            </button>
          </div>

          {/* Dynamic Collection Tabs: Click to switch edits live */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedEdit('all')}
              className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedEdit === 'all'
                  ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                  : 'bg-[var(--bg-cream)] text-[var(--ink-chocolate)] hover:bg-[var(--bg-tan)]'
              }`}
            >
              All Featured Edits
            </button>
            {collections.map((c) => (
              <button
                key={c.collectionId}
                type="button"
                onClick={() => setSelectedEdit(c.collectionId)}
                className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedEdit === c.collectionId
                    ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                    : 'bg-[var(--bg-cream)] text-[var(--ink-chocolate)] hover:bg-[var(--bg-tan)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dynamic Adaptive Layout */}
          {curatedLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[var(--brand-maroon)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="caption text-[var(--ink-soft)]">Unfolding handloom pieces...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-16 text-center bg-[var(--bg-cream)] rounded-[8px] p-6">
              <p className="serif-statement text-xl text-[var(--ink-chocolate)] mb-2">
                "This collection is currently on the studio looms."
              </p>
              <button
                onClick={() => navigate({ page: 'shop' })}
                className="btn btn-secondary btn-sm mt-3"
              >
                Browse Full Atelier
              </button>
            </div>
          ) : featuredProducts.length === 2 ? (
            /* Balanced 2-Column Equal Layout when 2 items are returned */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {featuredProducts.map((item) => (
                <ProductCard
                  key={item._id || item.slug}
                  product={item}
                  variant="editorial"
                  onSelect={(id) => navigate({ page: 'product', id })}
                />
              ))}
            </div>
          ) : (
            /* Asymmetric 7 cols / 5 cols Layout for 3+ items */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* 7 Columns: Large Hero Feature Card */}
              <div className="lg:col-span-7">
                {featuredProducts[0] && (
                  <ProductCard
                    product={featuredProducts[0]}
                    variant="editorial"
                    onSelect={(id) => navigate({ page: 'product', id })}
                  />
                )}
              </div>

              {/* 5 Columns: 2 Stacked Cards on Right */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                {featuredProducts.slice(1, 3).map((item) => (
                  <div
                    key={item._id || item.slug}
                    onClick={() => navigate({ page: 'product', id: item.slug || item._id })}
                    className="flex-1 flex gap-4 bg-[var(--bg-cream)] p-4 rounded-[8px] cursor-pointer hover:shadow-xs transition-shadow"
                  >
                    <div className="w-28 sm:w-32 h-36 bg-white rounded-[4px] overflow-hidden flex-shrink-0">
                      <img
                        src={item.images?.[0]?.url || item.image || '/images/hero.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-grow">
                      <div>
                        <span className="caption text-[var(--brand-maroon)] uppercase font-semibold text-[11px]">
                          {item.category}
                        </span>
                        <h4 className="text-[16px] font-medium text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] transition-colors mt-0.5 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="caption text-[var(--ink-soft)] mt-1 line-clamp-2 text-xs">
                          {item.heritageCraftStory || item.description || 'Authentic hand-spun natural dye cloth.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--line-khadi)]/50">
                        <span className="price font-bold text-sm">
                          {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Price on request'}
                        </span>
                        <span className="btn-ghost text-xs text-[var(--brand-maroon)] font-semibold">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. BESTSELLERS WITH SIGNATURE VIEW TOGGLE (§12.1 Item 4) */}
      <section className="rv-section bg-[var(--bg-cream)]/50 border-t border-[var(--line-khadi)]">
        <div className="rv-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[var(--line-khadi)]">
            <div>
              <p className="eyebrow text-[var(--brand-gold)] mb-1">Treasured Silhouettes</p>
              <h2 className="heading-1 text-[var(--brand-maroon)]">Bestsellers</h2>
            </div>

            {/* Signature Editorial / Grid View Toggle */}
            <div className="flex items-center gap-3">
              <span className="caption text-[var(--ink-soft)] uppercase tracking-wider text-[11px]">
                Layout:
              </span>
              <div className="view-toggle-track">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Grid size={14} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('editorial')}
                  className={`view-toggle-btn ${viewMode === 'editorial' ? 'active' : ''}`}
                >
                  <Layers size={14} />
                  <span>Editorial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Display according to view mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {bestsellers.slice(0, 8).map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  variant="grid"
                  onSelect={(id) => navigate({ page: 'product', id })}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {bestsellers.slice(0, 4).map((product, idx) => (
                <div
                  key={product._id || product.slug}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                >
                  <div className={`md:col-span-7 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                    <ProductCard
                      product={product}
                      variant="editorial"
                      onSelect={(id) => navigate({ page: 'product', id })}
                    />
                  </div>
                  <div className={`md:col-span-5 ${idx % 2 === 1 ? 'md:order-1' : ''} space-y-4`}>
                    <p className="eyebrow text-[var(--brand-gold)]">Handloom Certified</p>
                    <h3 className="heading-2 text-[var(--brand-maroon)]">{product.title}</h3>
                    <p className="body-l text-[var(--ink-chocolate)]/90">
                      {product.description ||
                        'Crafted painstakingly over forty days on pit looms in Bardoli, using single-spindle khadi yarns.'}
                    </p>
                    <div className="pt-2 flex items-center gap-4">
                      <button
                        onClick={() => navigate({ page: 'product', id: product.slug || product._id })}
                        className="btn btn-primary btn-md"
                      >
                        View Craft Details
                      </button>
                      <span className="price text-xl">₹{product.price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate({ page: 'shop' })}
              className="btn btn-secondary btn-md"
            >
              Explore All 33 Master Pieces
            </button>
          </div>
        </div>
      </section>

      {/* 5. THE HOUSE IN NUMBERS (§12.1 Item 5 - brand/maroon-deep band) */}
      <section className="w-full bg-[var(--brand-maroon-deep)] text-[var(--bg-cream)] py-16">
        <div className="rv-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="display-l font-bold text-[var(--brand-gold-soft)] mb-2">200+</p>
              <p className="caption text-[var(--bg-ivory)] uppercase tracking-widest">
                Women Artisans
              </p>
            </div>
            <div>
              <p className="display-l font-bold text-[var(--brand-gold-soft)] mb-2">3</p>
              <p className="caption text-[var(--bg-ivory)] uppercase tracking-widest">
                Generations of Weaving
              </p>
            </div>
            <div>
              <p className="display-l font-bold text-[var(--brand-gold-soft)] mb-2">100%</p>
              <p className="caption text-[var(--bg-ivory)] uppercase tracking-widest">
                Handloom & Organic
              </p>
            </div>
            <div>
              <p className="display-l font-bold text-[var(--brand-gold-soft)] mb-2">1</p>
              <p className="caption text-[var(--bg-ivory)] uppercase tracking-widest">
                Village Cluster (Bardoli)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STORY FEATURE (§12.1 Item 6 - 50/50 Split) */}
      <section className="rv-section bg-[var(--bg-ivory)]">
        <div className="rv-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="aspect-[4/5] bg-[var(--bg-cream)] overflow-hidden rounded-[0px]">
                <img
                  src="/images/founder-rachana-kapadia.jpg"
                  alt="Rachana Kapadia, Founder and Custodian of Rangvanat"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <p className="eyebrow text-[var(--brand-gold)]">The Founders' Voice</p>
              <h2 className="heading-1 text-[var(--brand-maroon)]">
                CLOTH THAT REMEMBERS ITS WEAVER
              </h2>
              <p className="body-l text-[var(--ink-chocolate)]">
                In Bardoli, cloth is not manufactured; it is listened to. When Mahatma Gandhi chose Bardoli as the crucible of the independence movement, spinning khadi was a declaration of sovereignty.
              </p>
              <p className="body-text text-[var(--ink-soft)]">
                Today, Rangvanat revives that sanctity. Our master artisans do not measure time by factory clocks, but by the rhythm of the wooden shuttle and the drying of natural indigo vats beneath the open Gujarat sun.
              </p>
              <blockquote className="serif-statement text-xl text-[var(--brand-maroon)] border-l-2 border-[var(--brand-gold)] pl-4 my-4">
                "A machine weaves uniform threads without memory. A human hand weaves slight irregularities that make each garment immortal."
              </blockquote>
              <div>
                <button
                  onClick={() => navigate({ page: 'story' })}
                  className="btn btn-primary btn-md"
                >
                  Read the Full Story →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. JOURNAL PREVIEW (§12.1 Item 7) */}
      <section className="rv-section bg-[var(--bg-cream)]/40 border-t border-[var(--line-khadi)]">
        <div className="rv-container">
          <div className="flex items-baseline justify-between mb-10 pb-4 border-b border-[var(--line-khadi)]">
            <div>
              <p className="eyebrow text-[var(--brand-gold)] mb-1">Dispatches</p>
              <h2 className="heading-1 text-[var(--brand-maroon)]">From the Loom Journal</h2>
            </div>
            <button
              onClick={() => navigate({ page: 'journal' })}
              className="btn-ghost text-[14px] font-semibold text-[var(--brand-maroon)]"
            >
              View all dispatches →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Alchemy of Fermented Indigo in Winter',
                date: 'October 18, 2026',
                readTime: '4 min read',
                image: '/images/dyeing.jpg',
                excerpt: 'How our master dyer wakes the fermentation vat with jaggery and water at dawn.',
              },
              {
                title: 'Why Real Khadi Breathes Cooler in Heat',
                date: 'September 29, 2026',
                readTime: '3 min read',
                image: '/images/spinning.jpg',
                excerpt: 'The physics of hand-twisted cotton fibres and capillary air traps in genuine handloom.',
              },
              {
                title: 'Preserving the Rare Patola Geometric Weave',
                date: 'September 12, 2026',
                readTime: '5 min read',
                image: '/images/heritage-main.jpg',
                excerpt: 'Double-ikat traditions carried through three generations of Bardoli artisan families.',
              },
            ].map((article, i) => (
              <div
                key={i}
                className="group cursor-pointer flex flex-col"
                onClick={() => navigate({ page: 'journal' })}
              >
                <div className="aspect-[16/10] overflow-hidden bg-[var(--bg-cream)] mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)] mb-2">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="heading-3 text-[18px] text-[var(--ink-chocolate)] group-hover:text-[var(--brand-maroon)] transition-colors mb-2">
                  {article.title}
                </h3>
                <p className="body-s line-clamp-2">{article.excerpt}</p>
                <span className="btn-ghost text-[13px] text-[var(--brand-maroon)] font-semibold mt-3 self-start">
                  Read Dispatch →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INSTAGRAM STRIP (§12.1 Item 9) */}
      <section className="w-full py-12 bg-[var(--bg-ivory)] border-t border-[var(--line-khadi)]">
        <div className="rv-container mb-6 text-center">
          <p className="eyebrow text-[var(--brand-gold)] mb-1">From the loom, daily</p>
          <p className="caption text-[var(--ink-soft)]">Follow our daily studio life on Instagram @rangvanat</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 px-2 max-w-[1440px] mx-auto">
          {[
            '/images/artisan1.jpg',
            '/images/spinning.jpg',
            '/images/heritage-detail.jpg',
            '/images/artisan2.jpg',
            '/images/dyeing.jpg',
            '/images/finishing.jpg',
          ].map((src, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group block bg-[var(--bg-cream)]"
            >
              <img
                src={src}
                alt="Rangvanat studio daily"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-[var(--brand-maroon)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                <InstagramIcon size={24} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 9. NEWSLETTER BAND (§12.1 Item 10) */}
      <section className="w-full bg-[var(--bg-cream)] py-16 border-t border-[var(--line-khadi)] text-center">
        <div className="rv-container max-w-xl">
          <p className="eyebrow text-[var(--brand-gold)] mb-2">Letters from the loom</p>
          <h2 className="heading-2 text-[var(--brand-maroon)] mb-3">
            JOIN THE CUSTODIANS OF KHADI
          </h2>
          <p className="body-text text-[var(--ink-soft)] mb-6">
            One letter when a story is ready. Limited editions, artisan profiles, and private lookbook previews.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="form-input flex-grow"
              required
            />
            <button type="submit" className="btn btn-primary btn-md">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
