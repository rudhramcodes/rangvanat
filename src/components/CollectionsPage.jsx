import { useEffect, useMemo, useRef, useState } from 'react'
import { Grid2X2, LayoutList, Search, SlidersHorizontal, X } from 'lucide-react'
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

const CollectionsPage = ({ initialCollection = 'all' }) => {
  const [query, setQuery] = useState('')
  const [collection, setCollection] = useState(initialCollection)
  const [category, setCategory] = useState('all')
  const [layout, setLayout] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [toolbarHidden, setToolbarHidden] = useState(false)
  const gridRef = useRef(null)
  const toolbarRef = useRef(null)
  const fabRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const suppressHideUntilRef = useRef(0)
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
    lastScrollYRef.current = window.scrollY
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

  // Debounced so the freshly filtered grid stays pinned below the sticky toolbar while typing
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
  }, [filtered, layout, reduced])

  useEffect(() => {
    if (reduced) return undefined
    lastScrollYRef.current = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastScrollYRef.current
        lastScrollYRef.current = y
        if (y < 140) setToolbarHidden(false)
        else if (delta > 6 && performance.now() > suppressHideUntilRef.current)
          setToolbarHidden(true)
        else if (delta < -6) setToolbarHidden(false)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  useEffect(() => {
    const el = toolbarRef.current
    if (!el) return undefined
    if (reduced) {
      el.style.transform = toolbarHidden ? 'translateY(-105%)' : 'translateY(0)'
      return undefined
    }
    const tween = animate(el, {
      translateY: toolbarHidden ? '-105%' : '0%',
      duration: 380,
      ease: toolbarHidden ? 'inOutCubic' : 'outCubic',
    })
    return () => tween.pause()
  }, [toolbarHidden, reduced])

  useEffect(() => {
    const el = fabRef.current
    if (!el) return undefined
    if (reduced) {
      el.style.opacity = toolbarHidden ? '1' : '0'
      el.style.transform = toolbarHidden ? 'scale(1)' : 'scale(0.6)'
      el.style.pointerEvents = toolbarHidden ? 'auto' : 'none'
      return undefined
    }
    const tween = animate(el, {
      opacity: toolbarHidden ? [0, 1] : 0,
      scale: toolbarHidden ? [0.6, 1] : 0.6,
      duration: 320,
      ease: 'outBack',
    })
    el.style.pointerEvents = toolbarHidden ? 'auto' : 'none'
    return () => tween.pause()
  }, [toolbarHidden, reduced])

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    selectCollection('all')
  }

  const hasFilters = query !== '' || collection !== 'all' || category !== 'all'

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

      {/* Filter bar */}
      <div className="lookbook-toolbar sticky top-[62px] z-30 m-0-[-5vw] p-[16px_5vw_14px] bg-ivory border-b border-brass/20 backdrop-blur-[16px] max-lg:top-[58px] max-lg:mx-[-24px] max-lg:px-6 max-lg:py-3 max-sm:top-[58px]" ref={toolbarRef} inert={toolbarHidden}>
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

          <div className="lookbook-layout-toggle flex gap-1 ml-auto border border-brass/30 rounded-[2px] p-[3px] max-sm:order-2" role="group" aria-label="View layout">
            <button
              type="button"
              className={layout === 'grid' ? 'is-active' : ''}
              onClick={() => setLayout('grid')}
              aria-pressed={layout === 'grid'}
              aria-label="Grid view"
            >
              <Grid2X2 size={16} />
            </button>
            <button
              type="button"
              className={layout === 'list' ? 'is-active' : ''}
              onClick={() => setLayout('list')}
              aria-pressed={layout === 'list'}
              aria-label="List view"
            >
              <LayoutList size={16} />
            </button>
          </div>

          <button
            type="button"
            className="lookbook-mobile-filters-toggle hidden max-sm:inline-flex items-center gap-2 min-h-[42px] p-0-[14px] border border-brass/30 rounded-[2px] bg-none text-espresso text-[12px] tracking-[0.1em] uppercase cursor-pointer relative max-sm:order-3"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="lookbook-filters"
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="lookbook-filter-dot absolute -top-1 -right-1 w-[9px] h-[9px] rounded-full bg-brass" aria-hidden="true" />}
          </button>
        </div>

        <div
          id="lookbook-filters"
          className={`lookbook-filters grid gap-[18px] mt-[14px] ${mobileFiltersOpen ? 'is-open' : ''} max-sm:hidden max-sm:is-open:grid`}
        >
          <div className="lookbook-filter-group grid grid-cols-[110px_1fr] gap-4 items-start max-sm:grid-cols-1 max-sm:gap-2.5">
            <span className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass">Collection</span>
            <div className="filter-chips flex flex-wrap gap-2">
              <FilterChip
                active={collection === 'all'}
                onClick={() => selectCollection('all')}
                count={PRODUCTS.length}
              >
                All
              </FilterChip>
              {COLLECTIONS.map((c) => (
                <FilterChip
                  key={c.id}
                  active={collection === c.id}
                  onClick={() => selectCollection(c.id)}
                  count={c.count}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="lookbook-filter-group grid grid-cols-[110px_1fr] gap-4 items-start max-sm:grid-cols-1 max-sm:gap-2.5">
            <span className="lookbook-filter-label pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass">Category</span>
            <div className="filter-chips flex flex-wrap gap-2">
              <FilterChip active={category === 'all'} onClick={() => selectCategory('all')}>
                All
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => selectCategory(c)}
                  count={PRODUCTS.filter((p) => p.category === c).length}
                >
                  {c}
                </FilterChip>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button type="button" className="lookbook-clear justify-self-end border-0 bg-none text-brass text-[12px] tracking-[0.08em] uppercase underline underline-offset-4 cursor-pointer hover:text-heritage" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results meta */}
      <div className="lookbook-results-meta flex items-baseline justify-between gap-4 flex-wrap p-[22px_0_8px] text-[11px] tracking-[0.18em] uppercase text-espresso/55">
        <span>{resultLabel}</span>
        {collection !== 'all' && getCollection(collection) && (
          <span className="lookbook-results-collection text-brass text-[12px] tracking-[0.04em] normal-case">
            {getCollection(collection).mood}
          </span>
        )}
      </div>

      {/* Product grid / list */}
      {filtered.length > 0 ? (
        <div
          ref={gridRef}
          className={`lookbook-results grid gap-7 mt-3 ${layout === 'grid' ? 'lookbook-layout-grid grid-cols-3 items-start max-lg:grid-cols-2 max-sm:grid-cols-1' : 'lookbook-layout-list grid-cols-1 gap-5'}`}
        >
          {filtered.map((product) => {
            const col = getCollection(product.collection)
            return (
              <a
                className={`lookbook-card flex flex-col cursor-pointer ${layout === 'list' ? 'grid grid-cols-[220px_1fr] gap-[28px] items-center p-[20px] border border-brass/18 bg-ivory transition-colors duration-250 hover:border-brass/50 hover:bg-champagne' : ''}`}
                key={product.id}
                href={`/?page=product&id=${product.id}`}
                aria-label={`View ${product.name}`}
              >
                <Asset
                  product={product}
                  className={layout === 'grid' ? 'aspect-[3/4]' : 'aspect-[4/5]'}
                />
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

      <button
        type="button"
        ref={fabRef}
        className="lookbook-fab fixed right-6 bottom-6 z-50 grid place-items-center w-13.5 h-13.5 border border-brass/55 rounded-full bg-espresso text-ivory shadow-[0_14px_34px_rgba(0,0,0,0.15)] cursor-pointer opacity-0 scale-[0.6] pointer-events-none transition-all duration-200 max-sm:right-[18px] max-sm:bottom-[calc(18px+env(safe-area-inset-bottom))] max-sm:w-[50px] max-sm:h-[50px]"
        onClick={() => {
          lastScrollYRef.current = window.scrollY
          suppressHideUntilRef.current = performance.now() + 700
          setToolbarHidden(false)
          if (window.matchMedia('(max-width: 640px)').matches) setMobileFiltersOpen(true)
        }}
        aria-label="Open filters"
        aria-expanded={!toolbarHidden}
        aria-controls="lookbook-filters"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        {hasFilters && <span className="lookbook-fab-dot absolute top-[4px] right-[4px] w-[10px] h-[10px] rounded-full bg-brass border-2 border-espresso" aria-hidden="true" />}
      </button>
    </div>
  )
}

export default CollectionsPage