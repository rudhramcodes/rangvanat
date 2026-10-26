import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useStore } from '../context/store';
import { api } from '../api/client';
import { CATEGORIES, COLLECTIONS } from '../lib/lookbook';
import { useDialog } from '../lib/useDialog';
import './header.css';

export default function Header({ navigate, currentRoute }) {
  const { cartCount, wishlist, customer, logout, openCart, settings } = useStore();
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [collections, setCollections] = useState([]);
  const header = useRef(null);
  const searchInput = useRef(null);
  const close = useCallback(() => setPanel(null), []);
  const mobileRef = useDialog(panel === 'mobile', close);
  useEffect(() => { api.getCollections().then(cols => setCollections(cols)).catch(() => { }); }, []);
  useEffect(() => {
    if (!panel) return;
    const outside = e => { if (!header.current?.contains(e.target)) close(); };
    const escape = e => { if (e.key === 'Escape') { close(); header.current?.querySelector(`[data-trigger="${panel}"]`)?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    if (panel === 'search') searchInput.current?.focus();
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [panel, close]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setLoading(false); return; }
      setLoading(true);
      setError(false);
      try {
        const res = await api.getProducts({ search: query.trim(), limit: 4 });
        if (active) { setResults(res.products || []); setError(Boolean(res.error)); }
      } catch { if (active) { setResults([]); setError(true); } }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);
  const go = target => { close(); navigate(target); };
  const toggle = name => setPanel(prev => prev === name ? null : name);
  const edits = collections.length ? collections.map(c => ({ ...c, id: c.collectionId })) : COLLECTIONS;
  const navLink = (label, page) => <a href={page === 'home' ? '/' : `/?page=${page}`} aria-current={currentRoute?.page === page ? 'page' : undefined} onClick={e => { e.preventDefault(); go({ page }); }}>{label}</a>;
  return <header className="store-header" ref={header}>
    <div className="header-row">
      <button className="header-icon mobile-toggle" aria-label="Open menu" aria-expanded={panel === 'mobile'} data-trigger="mobile" onClick={() => toggle('mobile')}><Menu size={22} /></button>
      <a className="store-brand" href="/" onClick={e => { e.preventDefault(); go({ page: 'home' }); }} aria-label="Rangvanat home"><img src={settings?.logo || '/images/logo-only.svg'} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/logo-only.svg'; }} /><span>Rangvanat</span></a>
      <nav className="desktop-nav" aria-label="Primary">{navLink('Home', 'home')}<button data-trigger="edits" aria-expanded={panel === 'edits'} aria-controls="catalog-menu" onClick={() => toggle('edits')}>Categories & edits <ChevronDown size={14} className={panel === 'edits' ? 'turned' : ''} /></button>{navLink('Our story', 'story')}{navLink('The craft', 'craft')}</nav>
      <div className="header-actions">
        <button className="search-trigger" data-trigger="search" aria-label="Search catalog" aria-expanded={panel === 'search'} onClick={() => toggle('search')}><Search size={18} /><span>Search pieces</span></button>
        <button className="header-icon account-trigger" data-trigger="account" aria-label="Account" aria-expanded={panel === 'account'} onClick={() => toggle('account')}><User size={20} /></button>
        <button className="header-icon wishlist-trigger" aria-label={`Wishlist (${wishlist.length})`} onClick={() => go({ page: 'account', tab: 'wishlist' })}><Heart size={20} /></button>
        <button className="header-icon bag-trigger" aria-label={`Shopping bag (${cartCount})`} onClick={() => { close(); openCart(); }}><ShoppingBag size={20} /><span>{cartCount}</span></button>
      </div>
    </div>
    {panel === 'edits' && <div className="header-panel mega-menu" id="catalog-menu">
      <div><h2>Shop by category</h2><div className="category-links">{CATEGORIES.map(category => <button key={category} onClick={() => go({ page: 'shop', category })}>{category}</button>)}</div><button className="menu-all" onClick={() => go({ page: 'shop' })}>Shop all pieces <ArrowRight size={17} /></button></div>
      <div><h2>The edits</h2><div className="collection-links">{edits.map(c => <button key={c.id} onClick={() => go({ page: 'shop', collection: c.id })}>{c.name}</button>)}</div></div>
      <button className="menu-feature" onClick={() => go({ page: 'shop', collection: 'flora' })}><img src="/images/flora-editorial.png" alt="Floral embroidery on a Khadi jacket" /><span>A softer kind of statement <ArrowRight size={18} /></span></button>
      <button className="header-icon panel-close" aria-label="Close categories" onClick={close}><X size={20} /></button>
    </div>}
    {panel === 'search' && <div className="header-panel search-panel"><form onSubmit={e => { e.preventDefault(); if (query.trim()) go({ page: 'shop', search: query.trim() }); }}><label htmlFor="catalog-search">Find something you’ll love</label><div className="search-input-wrap"><Search size={22} /><input ref={searchInput} id="catalog-search" type="search" value={query} placeholder="Try a jacket, saree or your favourite edit" onChange={e => { setQuery(e.target.value); setResults([]); setLoading(Boolean(e.target.value.trim())); }} /><button type="submit" aria-label="View search results"><ArrowRight size={22} /></button></div></form>
      {!query.trim() ? <div className="search-suggestions"><span>Explore</span>{['Jacket', 'Saree', 'Dress', 'Designer Fabric'].map(category => <button key={category} onClick={() => go({ page: 'shop', category })}>{category}</button>)}</div> : <div aria-live="polite" className="search-results">{loading ? <p>Searching the collection…</p> : error ? <p>We couldn’t load the catalog. Please try again shortly.</p> : results.length ? <>{results.map(p => <button key={p._id || p.slug} className="search-result" onClick={() => go({ page: 'product', id: p.slug || p._id })}><img src={p.images?.[0]?.url || '/images/hero-home.jpg'} alt="" /><span>{p.title}<small>{p.fabric || p.category}</small></span><span>₹{p.price?.toLocaleString('en-IN')}</span></button>)}<button className="menu-all" onClick={() => go({ page: 'shop', search: query.trim() })}>View all results <ArrowRight size={17} /></button></> : <p>No pieces found for “{query}”. Try a different fabric or silhouette.</p>}</div>}
      <button className="header-icon panel-close" aria-label="Close search" onClick={close}><X size={20} /></button></div>}
    {panel === 'account' && <div className="account-menu header-panel">{customer ? <><p>Hello, {customer.name}</p><button onClick={() => go({ page: 'account', tab: 'orders' })}>My orders</button><button onClick={() => go({ page: 'account', tab: 'wishlist' })}>My wishlist ({wishlist.length})</button><button onClick={() => go({ page: 'account', tab: 'addresses' })}>Saved addresses</button><button onClick={() => { close(); logout(); }}>Sign out</button></> : <><p>Your Rangvanat account</p><button onClick={() => go({ page: 'account', tab: 'login' })}>Sign in</button><button onClick={() => go({ page: 'account', tab: 'register' })}>Create an account</button></>}</div>}
    <div className={`mobile-navigation ${panel === 'mobile' ? 'is-open' : ''}`} inert={panel !== 'mobile'} aria-hidden={panel !== 'mobile'}>
      <div className="mobile-scrim" onClick={close} />
      <div className="mobile-navigation-inner" ref={mobileRef} role="dialog" aria-modal="true" aria-label="Navigation"><div className="mobile-title"><span>Explore Rangvanat</span><button className="header-icon" aria-label="Close menu" onClick={close}><X /></button></div><nav aria-label="Mobile">{navLink('Home', 'home')}{navLink('All pieces', 'shop')}<details><summary>Categories</summary>{CATEGORIES.map(category => <button key={category} onClick={() => go({ page: 'shop', category })}>{category}</button>)}</details><details><summary>The edits</summary>{edits.map(c => <button key={c.id} onClick={() => go({ page: 'shop', collection: c.id })}>{c.name}</button>)}</details>{navLink('Our story', 'story')}{navLink('The craft', 'craft')}{navLink('FAQ & care', 'faq')}</nav><button className="mobile-account" onClick={() => go({ page: 'account', tab: customer ? 'orders' : 'login' })}><User size={18} />{customer ? 'My account' : 'Sign in / Register'}</button><button className="mobile-account" onClick={() => go({ page: 'account', tab: 'wishlist' })}><Heart size={18} />Wishlist ({wishlist.length})</button></div>
    </div>
  </header>;
}
