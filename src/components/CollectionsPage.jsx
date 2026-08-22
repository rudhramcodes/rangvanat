import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { animate, stagger } from 'animejs'
import { PRODUCTS, COLLECTIONS, CATEGORIES, getCollection } from '../lib/lookbook'
import { useReducedMotion } from '../lib/motion'

const Asset = ({ product, className = '' }) => (
  <div
    className={`asset-frame lookbook-card-asset ${className}`}
    style={{ '--asset': `url(${product.image})` }}
    role="img"
    aria-label={product.name}
  >
    <span className="lookbook-card-code">{product.code}</span>
    {!product.image && <span className="asset-placeholder-tag">Image coming soon</span>}
  </div>
)

const FilterChip = ({ active, onClick, children, count }) => (
  <button
    type="button"
    className={`filter-chip${active ? ' is-active' : ''}`}
    onClick={onClick}
    aria-pressed={active}
  >
    {children}
    {count != null && <span className="filter-chip-count">{count}</span>}
  </button>
)

const MobileFilterSheet = ({ isOpen, onClose, collection, category, onSelectCollection, onSelectCategory, onClearFilters, hasFilters, reduced }) => {
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const sheet = sheetRef.current
    if (!sheet || reduced) return undefined

    const tween = animate(sheet, {
      translateY: [100, 0],
      duration: 400,
      ease: 'outCubic',
    })
    return () => tween.pause()
  }, [isOpen, reduced])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 max-lg:block hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
      <div
        className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-ivory border-t border-brass/20 rounded-t-[16px] p-[24px_20px_32px] max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="mobile-filter-title" className="text-[22px] font-display tracking-[0.02em]">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brass/20 transition-colors"
            aria-label="Close filters"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass block mb-3">Collection</label>
            <div className="filter-chips flex flex-wrap gap-2">
              <FilterChip
                active={collection === 'all'}
                onClick={() => { onSelectCollection('all'); onClose(); }}
                count={PRODUCTS.length}
              >
                All
              </FilterChip>
              {COLLECTIONS.map((c) => (
                <FilterChip
                  key={c.id}
                  active={collection === c.id}
                  onClick={() => { onSelectCollection(c.id); onClose(); }}
                  count={c.count}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <label className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass block mb-3">Category</label>
            <div className="filter-chips flex flex-wrap gap-2">
              <FilterChip active={category === 'all'} onClick={() => { onSelectCategory('all'); onClose(); }}>
                All
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => { onSelectCategory(c); onClose(); }}
                  count={PRODUCTS.filter((p) => p.category === c).length}
                >
                  {c}
                </FilterChip>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="w-full lookbook-clear border-0 bg-none text-brass text-[12px] tracking-[0.08em] uppercase underline underline-offset-4 cursor-pointer hover:text-heritage py-2"
              onClick={() => { onClearFilters(); onClose(); }}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CollectionsPage = ({ initialCollection = 'all' }) => {
  const [query, setQuery] = useState('')
  const [collection, setCollection] = useState(initialCollection)
  const [category, setCategory] = useState('all')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)
  const gridRef = useRef(null)
  const toolbarRef = useRef(null)
  const reduced = useReducedMotion()

  const selectCollection = (id) => {
    setCollection(id)
    const base = '/?page=collections'
    const nextUrl = id === 'all' ? base : `${base}&collection=${id}`
    if (nextUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState({}, '', nextUrl)
    }
    scrollToResults()
  }

  const selectCategory = (c) => {
    setCategory(c)
    scrollToResults()
  }

  const scrollToResults = (behavior = 'smooth') => {
    const grid = gridRef.current
    const headerH = document.querySelector('.site-header')?.getBoundingClientRect().height || 62
    const toolbarH = toolbarRef.current?.getBoundingClientRect().height || 0
    const target = grid
      ? Math.max(0, grid.getBoundingClientRect().top + window.scrollY - headerH - toolbarH)
      : 0
    window.scrollTo({ top: target, behavior })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      if (collection !== 'all' && p.collection !== collection) return false
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      const haystack = [p.code, p.name, p.tagline, p.category, p.description]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, collection, category])

  const resultLabel = `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`

  const prevQueryRef = useRef(query)
  const scrollToResultsRef = useRef(scrollToResults)
  useEffect(() => {
    scrollToResultsRef.current = scrollToResults
  })
  useEffect(() => {
    const changed = prevQueryRef.current !== query
    prevQueryRef.current = query
    if (!changed) return undefined
    if (reduced) return undefined
    const t = setTimeout(() => scrollToResultsRef.current('auto'), 300)
    return () => clearTimeout(t)
  }, [query, reduced])

  useEffect(() => {
    if (reduced) return undefined
    const cards = gridRef.current?.querySelectorAll('.lookbook-card')
    if (!cards?.length) return undefined
    const tween = animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 480,
      ease: 'outQuad',
      delay: stagger(45),
    })
    return () => tween.pause()
  }, [filtered, reduced])

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    selectCollection('all')
  }

  const hasFilters = query !== '' || collection !== 'all' || category !== 'all'

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    if (!desktopFiltersOpen) return
    const handleClickOutside = (e) => {
      const toolbar = toolbarRef.current
      if (toolbar && !toolbar.contains(e.target)) {
        setDesktopFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [desktopFiltersOpen])

  return (
    <div className="lookbook-page min-h-[100svh] p-[64px_5vw_96px] bg-ivory max-lg:p-[48px_24px_72px] max-sm:p-[40px_20px_72px]">
      {/* Page header */}
      <header className="lookbook-hero">
        <div className="lookbook-hero-inner">
          <p className="eyebrow">The Rangvanat Lookbook</p>
          <h1 className="mt-[22px] m-0 text-[clamp(56px,7.5vw,96px)] leading-[0.92]">Where Heritage Meets the Runway.</h1>
          <p className="lookbook-hero-intro m-0 max-w-[540px] max-sm:mb-[36px]">
            Every piece carries a lineage. Every thread speaks of heritage. Browse the
            collections, filter by craft, and find the story you want to wear.
          </p>
        </div>
      </header>

      {/* Filter bar - Desktop: dropdown filters. Mobile: search only + FAB */}
      <div className="lookbook-toolbar sticky top-[62px] z-30 m-0-[-5vw] p-[16px_5vw_14px] bg-ivory border-b border-brass/20 backdrop-blur-[16px] max-lg:top-[58px] max-lg:mx-[-24px] max-lg:px-6 max-lg:py-3 max-sm:top-[58px]" ref={toolbarRef}>
        <div className="lookbook-toolbar-row flex items-center gap-4 max-sm:flex-wrap">
          <label className="lookbook-search relative flex items-center flex-1 max-w-[420px] text-espresso/55 max-sm:max-w-none max-sm:flex-[1_1_100%] max-sm:order-1">
            <Search size={16} aria-hidden="true" className="absolute left-[14px] pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pieces, codes, crafts…"
              aria-label="Search the lookbook"
              className="w-full min-h-[42px] p-[0_38px_0_42px] border border-brass/40 rounded-[2px] bg-ivory text-espresso text-[14px] outline-none transition-colors duration-200 placeholder:text-espresso/45 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  scrollToResults()
                }}
                aria-label="Clear search"
                className="absolute right-[10px] grid place-items-center w-[26px] h-[26px] border-0 bg-none text-espresso cursor-pointer rounded-full hover:bg-brass/20"
              >
                <X size={14} />
              </button>
            )}
          </label>

          {/* Desktop filter dropdown */}
          <div className="hidden lg:flex lg:items-center lg:relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 min-h-[42px] px-[14px] border border-brass/30 rounded-[2px] bg-ivory text-espresso text-[12px] tracking-[0.1em] uppercase cursor-pointer relative hover:bg-champagne transition-colors"
              onClick={() => setDesktopFiltersOpen((v) => !v)}
              aria-expanded={desktopFiltersOpen}
              aria-haspopup="true"
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters && <span className="lookbook-filter-dot absolute -top-1 -right-1 w-[9px] h-[9px] rounded-full bg-brass" aria-hidden="true" />}
              <ChevronDown size={14} className={`transition-transform ${desktopFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            {desktopFiltersOpen && (
              <div className="absolute right-0 top-full mt-2 z-40 w-[320px] bg-ivory border border-brass/30 rounded-[4px] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.12)] animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="space-y-5">
                  <div>
                    <label className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass block mb-3">Collection</label>
                    <div className="filter-chips flex flex-wrap gap-2">
                      <FilterChip
                        active={collection === 'all'}
                        onClick={() => { selectCollection('all'); setDesktopFiltersOpen(false); }}
                        count={PRODUCTS.length}
                      >
                        All
                      </FilterChip>
                      {COLLECTIONS.map((c) => (
                        <FilterChip
                          key={c.id}
                          active={collection === c.id}
                          onClick={() => { selectCollection(c.id); setDesktopFiltersOpen(false); }}
                          count={c.count}
                        >
                          {c.name}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass block mb-3">Category</label>
                    <div className="filter-chips flex flex-wrap gap-2">
                      <FilterChip active={category === 'all'} onClick={() => { selectCategory('all'); setDesktopFiltersOpen(false); }}>
                        All
                      </FilterChip>
                      {CATEGORIES.map((c) => (
                        <FilterChip
                          key={c}
                          active={category === c}
                          onClick={() => { selectCategory(c); setDesktopFiltersOpen(false); }}
                          count={PRODUCTS.filter((p) => p.category === c).length}
                        >
                          {c}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <button type="button" className="w-full lookbook-clear border-0 bg-none text-brass text-[12px] tracking-[0.08em] uppercase underline underline-offset-4 cursor-pointer hover:text-heritage py-2" onClick={() => { clearFilters(); setDesktopFiltersOpen(false); }}>
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet (Bottom Sheet) */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        collection={collection}
        category={category}
        onSelectCollection={selectCollection}
        onSelectCategory={selectCategory}
        onClearFilters={clearFilters}
        hasFilters={hasFilters}
        reduced={reduced}
      />

      {/* Mobile FAB - Bottom Right */}
      <button
        type="button"
        className="lg:hidden fixed right-5 bottom-5 z-50 grid place-items-center w-14 h-14 border border-brass/55 rounded-full bg-espresso text-ivory shadow-[0_14px_34px_rgba(0,0,0,0.15)] cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => setMobileFiltersOpen(true)}
        aria-label="Open filters"
        aria-expanded={mobileFiltersOpen}
      >
        <SlidersHorizontal size={20} aria-hidden="true" />
        {hasFilters && <span className="absolute top-[2px] right-[2px] w-[10px] h-[10px] rounded-full bg-brass border-2 border-espresso" aria-hidden="true" />}
      </button>

      {/* Results meta */}
      <div className="lookbook-results-meta flex items-baseline justify-between gap-4 flex-wrap p-[22px_0_8px] text-[11px] tracking-[0.18em] uppercase text-espresso/55">
        <span>{resultLabel}</span>
        {collection !== 'all' && getCollection(collection) && (
          <span className="lookbook-results-collection text-brass text-[12px] tracking-[0.04em] normal-case">
            {getCollection(collection).mood}
          </span>
        )}
      </div>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div
          ref={gridRef}
          className="lookbook-results lookbook-layout-grid grid grid-cols-3 gap-7 mt-3 items-start max-lg:grid-cols-2 max-sm:grid-cols-1"
        >
          {filtered.map((product) => {
            const col = getCollection(product.collection)
            return (
              <a
                className="lookbook-card flex flex-col cursor-pointer"
                key={product.id}
                href={`/?page=product&id=${product.id}`}
                aria-label={`View ${product.name}`}
              >
                <Asset product={product} className="aspect-[3/4]" />
                <div className="lookbook-card-body pt-4 max-sm:pt-0">
                  <span className="lookbook-card-cat inline-block text-[10px] tracking-[0.16em] uppercase text-brass mr-2.5">{product.category}</span>
                  {col && <span className="lookbook-card-col inline-block text-[10px] tracking-[0.16em] uppercase text-espresso/50">{col.name}</span>}
                  <h3 className="mt-[10px] mb-[6px] text-[22px] max-sm:text-[28px]">{product.name}</h3>
                  <p className="m-0 mb-[10px] text-[13px] italic text-espresso/60 max-sm:text-[14px] max-sm:max-w-[520px]">{product.tagline}</p>
                  <span className="lookbook-card-enquire text-[11px] tracking-[0.14em] uppercase text-brass transition-[letter-spacing] duration-200 group-hover:tracking-[0.2em] max-sm:text-[14px]">View details →</span>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="lookbook-empty grid justify-items-start gap-[14px] p-[72px_0]">
          <p className="eyebrow">No matches</p>
          <h2 className="m-0 text-[clamp(40px,4.5vw,60px)]">Nothing wove its way in.</h2>
          <p className="max-w-[460px] m-0 mb-[12px]">
            No pieces match your search. Try a different keyword, or clear the filters to see
            the full lookbook.
          </p>
          <button type="button" className="cta cta-md" onClick={clearFilters}>
            <span className="cta-label">Clear filters</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default CollectionsPage