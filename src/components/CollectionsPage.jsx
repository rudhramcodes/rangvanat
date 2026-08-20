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
    <div className="lookbook-page">
      {/* Page header */}
      <header className="lookbook-hero">
        <div className="lookbook-hero-inner">
          <p className="eyebrow">The Rangvanat Lookbook</p>
          <h1>Where Heritage Meets the Runway.</h1>
          <p className="lookbook-hero-intro">
            Every piece carries a lineage. Every thread speaks of heritage. Browse the
            collections, filter by craft, and find the story you want to wear.
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="lookbook-toolbar" ref={toolbarRef} inert={toolbarHidden}>
        <div className="lookbook-toolbar-row">
          <label className="lookbook-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pieces, codes, crafts…"
              aria-label="Search the lookbook"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  scrollToResults()
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <div className="lookbook-layout-toggle" role="group" aria-label="View layout">
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
            className="lookbook-mobile-filters-toggle"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="lookbook-filters"
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="lookbook-filter-dot" aria-hidden="true" />}
          </button>
        </div>

        <div
          id="lookbook-filters"
          className={`lookbook-filters${mobileFiltersOpen ? ' is-open' : ''}`}
        >
          <div className="lookbook-filter-group">
            <span className="lookbook-filter-label">Collection</span>
            <div className="filter-chips">
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

          <div className="lookbook-filter-group">
            <span className="lookbook-filter-label">Category</span>
            <div className="filter-chips">
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
            <button type="button" className="lookbook-clear" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results meta */}
      <div className="lookbook-results-meta">
        <span>{resultLabel}</span>
        {collection !== 'all' && getCollection(collection) && (
          <span className="lookbook-results-collection">
            {getCollection(collection).mood}
          </span>
        )}
      </div>

      {/* Product grid / list */}
      {filtered.length > 0 ? (
        <div
          ref={gridRef}
          className={`lookbook-results lookbook-layout-${layout}`}
        >
          {filtered.map((product) => {
            const col = getCollection(product.collection)
            return (
              <a
                className="lookbook-card"
                key={product.id}
                href={`/?page=product&id=${product.id}`}
                aria-label={`View ${product.name}`}
              >
                <Asset product={product} />
                <div className="lookbook-card-body">
                  <span className="lookbook-card-cat">{product.category}</span>
                  {col && <span className="lookbook-card-col">{col.name}</span>}
                  <h3>{product.name}</h3>
                  <p>{product.tagline}</p>
                  <span className="lookbook-card-enquire">View details →</span>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="lookbook-empty">
          <p className="eyebrow">No matches</p>
          <h2>Nothing wove its way in.</h2>
          <p>
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
        className="lookbook-fab"
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
        {hasFilters && <span className="lookbook-fab-dot" aria-hidden="true" />}
      </button>
    </div>
  )
}

export default CollectionsPage