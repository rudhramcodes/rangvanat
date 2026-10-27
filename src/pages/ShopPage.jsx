import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, Search, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { CATEGORIES } from '../lib/lookbook.js';
import { useDialog } from '../lib/useDialog.js';

const SORT_OPTIONS = [['featured', 'Featured'], ['newest', 'Newest arrivals'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low']];
const PRICES = [{ id: 'all', label: 'All prices' }, { id: 'under5k', label: 'Under ₹5,000', max: 5000 }, { id: '5k-10k', label: '₹5,000 – ₹10,000', min: 5000, max: 10000 }, { id: 'above10k', label: 'Above ₹10,000', min: 10000 }];

export default function ShopPage({ initialCollection = 'all', initialCategory = 'all', initialSearch = '', navigate }) {
  const [filters, setFilters] = useState({ collection: initialCollection, category: initialCategory, price: 'all', inStock: false, sort: 'featured', page: 1 });
  const [search, setSearch] = useState(initialSearch);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const closeFilters = useCallback(() => setFilterOpen(false), []);
  const dialog = useDialog(filterOpen, closeFilters);
  const change = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const clear = () => setFilters(prev => ({ ...prev, collection: 'all', category: 'all', price: 'all', inStock: false, page: 1 }));
  useEffect(() => { let alive = true; api.getCollections().then(data => { if (alive) setCollections(data); }).catch(() => {}); return () => { alive = false; }; }, []);
  useEffect(() => {
    let alive = true;
    // A new filter request replaces the previous catalog loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError('');
    const price = PRICES.find(p => p.id === filters.price);
    api.getProducts({ ...filters, search: initialSearch, minPrice: price.min, maxPrice: price.max, limit: 24 }).then(res => {
      if (!alive) return;
      if (res.error) { setError(res.error); return; }
      setProducts(prev => filters.page === 1 ? (res.products || []) : [...prev, ...(res.products || [])]);
      setTotal(res.pagination?.total || 0);
      if (res.facets?.categories?.length) setCategories(res.facets.categories);
    }).catch(() => { if (alive) setError('The collection could not be loaded. Please try again.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filters, initialSearch, retry]);
  const selected = collections.find(c => c.collectionId === filters.collection);
  const active = [filters.collection !== 'all' && { label: selected?.name || filters.collection, key: 'collection', value: 'all' }, filters.category !== 'all' && { label: filters.category, key: 'category', value: 'all' }, filters.price !== 'all' && { label: PRICES.find(p => p.id === filters.price).label, key: 'price', value: 'all' }, filters.inStock && { label: 'Ready to ship', key: 'inStock', value: false }].filter(Boolean);
  const filterFields = prefix => <>
    <fieldset><legend>The edits</legend>{[{ collectionId: 'all', name: 'All collections' }, ...collections].map(c => <label key={c.collectionId}><input type="radio" name={`${prefix}-collection`} checked={filters.collection === c.collectionId} onChange={() => change('collection', c.collectionId)} />{c.name}</label>)}</fieldset>
    <fieldset><legend>Silhouette</legend>{['all', ...categories].map(c => <label key={c}><input type="radio" name={`${prefix}-category`} checked={filters.category === c} onChange={() => change('category', c)} />{c === 'all' ? 'All silhouettes' : c}</label>)}</fieldset>
    <fieldset><legend>Price range</legend>{PRICES.map(p => <label key={p.id}><input type="radio" name={`${prefix}-price`} checked={filters.price === p.id} onChange={() => change('price', p.id)} />{p.label}</label>)}</fieldset>
    <fieldset><legend>Availability</legend><label><input type="checkbox" checked={filters.inStock} onChange={e => change('inStock', e.target.checked)} />Ready to ship</label></fieldset>
  </>;
  return <main id="main-content" className="catalog-page">
    <section className="catalog-hero">
      <div><nav className="screen-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }}>Home</a><span>/</span><span>{initialSearch ? 'Search' : 'Collection'}</span></nav>
      <h1>{initialSearch ? 'Find your next piece' : selected?.name || (filters.category !== 'all' ? filters.category : 'Cloth with character')}</h1>
      <p>{initialSearch ? `Results for “${initialSearch}”` : selected?.mood || 'Handspun textures, considered silhouettes. Discover the pieces that feel like you.'}</p>
      {initialSearch && <form className="catalog-search" onSubmit={e => { e.preventDefault(); navigate({ page: 'shop', search: search.trim() }); }}><Search size={18} /><input aria-label="Search the collection" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pieces, fabrics or edits" /><button aria-label="Search" type="submit"><ArrowRight size={20} /></button></form>}
      </div><img src={selected?.coverImage || '/images/hero-editorial-couture.jpg'} alt={selected?.name || 'A handwoven Khadi silhouette'} />
    </section>
    <div className="catalog-workspace">
      <div className="catalog-toolbar"><p role="status">{loading && filters.page === 1 ? 'Gathering the collection…' : `${total} ${total === 1 ? 'piece' : 'pieces'}`}</p><div><button className="catalog-filter-trigger btn-secondary" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={17} />Filters {active.length > 0 && `(${active.length})`}</button><label className="catalog-sort">Sort by<select value={filters.sort} onChange={e => change('sort', e.target.value)}>{SORT_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div></div>
      {active.length > 0 && <div className="catalog-selected">{active.map(f => <button key={f.key} onClick={() => change(f.key, f.value)} aria-label={`Remove ${f.label} filter`}>{f.label}<X size={14} /></button>)}<button onClick={clear}>Clear all</button></div>}
      <div className="catalog-layout"><aside className="catalog-filters" aria-label="Filter products">{filterFields('desktop')}</aside><div className="catalog-results" aria-busy={loading}>
        {error ? <div className="screen-empty" role="alert"><h2>A moment, please</h2><p>{error}</p><button className="btn-primary" onClick={() => setRetry(n => n + 1)}>Try again</button></div> : loading && filters.page === 1 ? <div className="catalog-skeleton" aria-label="Loading products">{Array.from({ length: 6 }, (_, i) => <div key={i} />)}</div> : products.length ? <><div className="catalog-grid">{products.map(p => <ProductCard key={p._id || p.slug} product={p} onSelect={id => navigate({ page: 'product', id })} />)}</div><div className="catalog-pagination"><p>{products.length} of {total} pieces</p>{products.length < total && <button className="btn-secondary" disabled={loading} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}>{loading ? 'Loading…' : 'Discover more pieces'}</button>}</div></> : <div className="screen-empty"><h2>A different thread?</h2><p>No pieces match this selection. Try another silhouette or explore the whole collection.</p><button className="btn-primary" onClick={initialSearch ? () => navigate({ page: 'shop' }) : clear}>{initialSearch ? 'Explore all pieces' : 'Clear filters'}</button></div>}
      </div></div>
    </div>
    <div className={`filter-drawer ${filterOpen ? 'is-open' : ''}`} inert={!filterOpen} aria-hidden={!filterOpen}><div className="filter-scrim" onClick={closeFilters} /><aside ref={dialog} role="dialog" aria-modal="true" aria-label="Filter products"><header><h2>Find your piece</h2><button aria-label="Close filters" onClick={closeFilters}><X /></button></header><div className="filter-drawer-body">{filterFields('mobile')}</div><footer><button className="btn-secondary" onClick={clear}>Clear all</button><button className="btn-primary" onClick={closeFilters}>View pieces</button></footer></aside></div>
  </main>;
}
