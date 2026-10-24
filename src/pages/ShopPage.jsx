import { useState, useEffect } from 'react';
import { SlidersHorizontal, Grid, Layers, X, ChevronDown, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';

export default function ShopPage({ initialCollection = 'all', initialCategory = 'all', initialSearch = '', navigate }) {
  const [collection, setCollection] = useState(initialCollection);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under10k' | '10k-18k' | 'above18k'
  const [viewMode, setViewMode] = useState('grid');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Load master collections for filters
  useEffect(() => {
    api.getCollections().then((data) => setCollectionsList(data || []));
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    let minPrice = null;
    let maxPrice = null;
    if (priceRange === 'under10k') maxPrice = 10000;
    else if (priceRange === '10k-18k') {
      minPrice = 10000;
      maxPrice = 18000;
    } else if (priceRange === 'above18k') minPrice = 18000;

    setLoading(true);
    api
      .getProducts({
        collection,
        category,
        sort,
        search: initialSearch,
        minPrice,
        maxPrice,
        inStock: inStockOnly,
        page: 1,
        limit: 24,
      })
      .then((data) => {
        if (data) {
          setProducts(data.products || []);
          setTotalCount(data.pagination?.total || data.products?.length || 0);
          setHasMore(data.pagination?.hasMore || false);
        }
        setPage(1);
        setLoading(false);
      });
  }, [collection, category, sort, priceRange, inStockOnly, initialSearch]);

  const loadMore = async () => {
    const nextPage = page + 1;
    let minPrice = null;
    let maxPrice = null;
    if (priceRange === 'under10k') maxPrice = 10000;
    else if (priceRange === '10k-18k') {
      minPrice = 10000;
      maxPrice = 18000;
    } else if (priceRange === 'above18k') minPrice = 18000;

    const data = await api.getProducts({
      collection,
      category,
      sort,
      search: initialSearch,
      minPrice,
      maxPrice,
      inStock: inStockOnly,
      page: nextPage,
      limit: 24,
    });
    if (data?.products?.length) {
      setProducts((prev) => [...prev, ...data.products]);
      setPage(nextPage);
      setHasMore(data.pagination?.hasMore || false);
    }
  };

  const clearAllFilters = () => {
    setCollection('all');
    setCategory('all');
    setPriceRange('all');
    setInStockOnly(false);
  };

  const activeFiltersCount =
    (collection !== 'all' ? 1 : 0) +
    (category !== 'all' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const getCollectionTitle = () => {
    if (initialSearch) return `Search Results for "${initialSearch}"`;
    if (collection !== 'all') {
      const match = collectionsList.find((c) => c.collectionId === collection);
      return match ? match.name : `The ${collection.toUpperCase()} Edit`;
    }
    if (category !== 'all') return `${category} Archive`;
    return 'The Complete Handloom Atelier';
  };

  const getCollectionDescription = () => {
    if (collection !== 'all') {
      const match = collectionsList.find((c) => c.collectionId === collection);
      return match ? match.mood : 'Hand-spun khadi garments designed with organic soul.';
    }
    return 'Each piece begins with pure cotton spun on charkhas in Bardoli, dyed naturally and tailored for modern timelessness.';
  };

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-10 md:py-14">
      <div className="rv-container">
        {/* Breadcrumbs (§12) */}
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">Shop</span>
          {collection !== 'all' && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
              <span className="capitalize">{collection} Edit</span>
            </>
          )}
        </nav>

        {/* Header Zone (§12.2) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[var(--line-khadi)]">
          <div className="max-w-2xl">
            <h1 className="heading-1 text-[var(--brand-maroon)] uppercase">{getCollectionTitle()}</h1>
            <p className="body-l text-[var(--ink-soft)] mt-2">{getCollectionDescription()}</p>
          </div>
          <span className="caption text-[var(--ink-soft)] font-medium">
            Showing <strong className="text-[var(--ink-chocolate)]">{products.length}</strong> of{' '}
            <strong className="text-[var(--ink-chocolate)]">{totalCount}</strong> pieces
          </span>
        </div>

        {/* Sticky Toolbar (§12.2) */}
        <div className="sticky top-[60px] md:top-[72px] z-30 bg-[var(--bg-ivory)]/95 backdrop-blur-md py-4 border-b border-[var(--line-khadi)] flex flex-wrap items-center justify-between gap-4 my-6">
          {/* Left: Filter Toggle & Active Pills */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterPanelOpen((prev) => !prev)}
              className={`btn btn-sm ${activeFiltersCount > 0 ? 'btn-primary' : 'btn-secondary'
                } flex items-center gap-2`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Active Filter Pills */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {collection !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-maroon-tint)] text-[var(--brand-maroon)] text-xs font-medium">
                  {collection}
                  <button onClick={() => setCollection('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-maroon-tint)] text-[var(--brand-maroon)] text-xs font-medium">
                  {category}
                  <button onClick={() => setCategory('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-maroon-tint)] text-[var(--brand-maroon)] text-xs font-medium">
                  {priceRange === 'under10k' ? '< ₹10,000' : priceRange === '10k-18k' ? '₹10k - ₹18k' : '> ₹18,000'}
                  <button onClick={() => setPriceRange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn-ghost text-xs text-[var(--ink-soft)] hover:text-[var(--state-error)]"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Center: Editorial / Grid View Toggle */}
          <div className="view-toggle-track">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label="Grid view"
            >
              <Grid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editorial')}
              className={`view-toggle-btn ${viewMode === 'editorial' ? 'active' : ''}`}
              aria-label="Editorial view"
            >
              <Layers size={15} />
              <span className="hidden sm:inline">Editorial</span>
            </button>
          </div>

          {/* Right: Sort Select */}
          <div className="flex items-center gap-2">
            <span className="caption text-[var(--ink-soft)] text-xs">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select h-9 px-3 text-xs w-auto bg-white border-[var(--line-khadi)] rounded-[2px]"
            >
              <option value="featured">Featured Atelier</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newly Spun</option>
            </select>
          </div>
        </div>

        {/* Main Content Area: Sidebar Filter + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Panel (Desktop Sidebar / Mobile Drawer) */}
          {filterPanelOpen && (
            <aside className="lg:col-span-3 bg-white p-6 border border-[var(--line-khadi)] rounded-[2px] space-y-6 self-start shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line-khadi)]">
                <h3 className="heading-3 text-[var(--ink-chocolate)] uppercase text-base">Filter Pieces</h3>
                <button
                  onClick={() => setFilterPanelOpen(false)}
                  className="text-[var(--ink-soft)] hover:text-[var(--brand-maroon)]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Group 1: Collection Edits */}
              <div>
                <p className="eyebrow text-[var(--brand-gold)] mb-3">Collection Edits</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="coll"
                      checked={collection === 'all'}
                      onChange={() => setCollection('all')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>All Edits</span>
                  </label>
                  {collectionsList.map((c) => (
                    <label key={c.collectionId} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="coll"
                          checked={collection === c.collectionId}
                          onChange={() => setCollection(c.collectionId)}
                          className="accent-[var(--brand-maroon)]"
                        />
                        <span>{c.name}</span>
                      </div>
                      <span className="caption text-[var(--ink-soft)] text-xs">({c.productCount || 6})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group 2: Categories */}
              <div>
                <p className="eyebrow text-[var(--brand-gold)] mb-3">Category</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === 'all'}
                      onChange={() => setCategory('all')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>All Categories</span>
                  </label>
                  {['Sarees', 'Dupatta', 'Designer Fabric', 'Co-ord Set', 'Jacket', 'Dress', 'Skirt & Top'].map(
                    (cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="cat"
                          checked={category === cat}
                          onChange={() => setCategory(cat)}
                          className="accent-[var(--brand-maroon)]"
                        />
                        <span>{cat}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Group 3: Price Filter */}
              <div>
                <p className="eyebrow text-[var(--brand-gold)] mb-3">Investment</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'all'}
                      onChange={() => setPriceRange('all')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>All Prices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'under10k'}
                      onChange={() => setPriceRange('under10k')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>Under ₹10,000</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '10k-18k'}
                      onChange={() => setPriceRange('10k-18k')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>₹10,000 – ₹18,000</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'above18k'}
                      onChange={() => setPriceRange('above18k')}
                      className="accent-[var(--brand-maroon)]"
                    />
                    <span>Above ₹18,000</span>
                  </label>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-2 border-t border-[var(--line-khadi)]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-[var(--ink-chocolate)]">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[var(--brand-maroon)] w-4 h-4"
                  />
                </label>
              </div>

              {/* Filter Panel Actions */}
              <div className="pt-4 border-t border-[var(--line-khadi)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-ghost text-xs text-[var(--ink-soft)]"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(false)}
                  className="btn btn-primary btn-sm"
                >
                  Show {products.length} Results
                </button>
              </div>
            </aside>
          )}

          {/* Products Grid Area */}
          <div className={filterPanelOpen ? 'lg:col-span-9' : 'lg:col-span-12'}>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="aspect-[3/4] bg-[var(--bg-cream)]" />
                    <div className="h-4 bg-[var(--bg-cream)] w-3/4" />
                    <div className="h-4 bg-[var(--bg-cream)] w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="serif-statement text-2xl text-[var(--ink-chocolate)] mb-3">
                  "No pieces match your chosen combination, but our looms are weaving."
                </p>
                <p className="body-s text-[var(--ink-soft)] mb-6">
                  Try clearing some filters or browse our complete heritage lookbook.
                </p>
                <button onClick={clearAllFilters} className="btn btn-primary btn-md">
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div
                className={`grid grid-cols-2 ${filterPanelOpen ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'
                  } gap-6 md:gap-8`}
              >
                {products.map((p) => (
                  <ProductCard
                    key={p._id || p.slug}
                    product={p}
                    variant="grid"
                    onSelect={(id) => navigate({ page: 'product', id })}
                  />
                ))}
              </div>
            ) : (
              /* Editorial View Mode (§12.2) */
              <div className="space-y-14">
                {products.map((p, idx) => (
                  <div
                    key={p._id || p.slug}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''
                      }`}
                  >
                    <div className={`md:col-span-7 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                      <ProductCard
                        product={p}
                        variant="editorial"
                        onSelect={(id) => navigate({ page: 'product', id })}
                      />
                    </div>
                    <div className={`md:col-span-5 ${idx % 2 === 1 ? 'md:order-1' : ''} space-y-4`}>
                      <span className="caption text-[var(--brand-gold)] font-semibold uppercase">
                        {p.category} · Bardoli Handloom
                      </span>
                      <h3 className="heading-2 text-[var(--brand-maroon)]">{p.title}</h3>
                      <p className="body-l text-[var(--ink-chocolate)]">
                        {p.description ||
                          'Spun with indigenous cotton and woven on wooden looms. Each piece is an unrepeatable work of Indian heritage.'}
                      </p>
                      <div className="pt-2 flex items-center gap-4">
                        <button
                          onClick={() => navigate({ page: 'product', id: p.slug || p._id })}
                          className="btn btn-primary btn-md"
                        >
                          View Full Piece
                        </button>
                        <span className="price text-xl font-bold">
                          ₹{p.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination / Load More (§12.2) */}
            {hasMore && (
              <div className="text-center mt-16 pt-8 border-t border-[var(--line-khadi)]">
                <p className="caption text-[var(--ink-soft)] mb-3">
                  Showing {products.length} of {totalCount} handcrafted pieces
                </p>
                <button onClick={loadMore} className="btn btn-primary btn-md">
                  Load More Pieces
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
