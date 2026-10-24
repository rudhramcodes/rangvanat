import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import {api} from '../api/client';
import { useStore } from '../context/store.js';

export default function Header({ navigate }) {
  const { cartCount, wishlist, openCart, customer, logout, settings } = useStore();
  const [collections,setCollections]=useState([]);
  useEffect(()=>{api.getCollections().then(setCollections);},[]);
  const [scrolled, setScrolled] = useState(false);
  const [accountDropOpen, setAccountDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);


  // Handle sticky header scroll past 24px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      queueMicrotask(()=>{setSearchResults([]);setSearching(false);});
      return;
    }
    queueMicrotask(()=>setSearching(true));
    let active=true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=4`);
        const json = await res.json();
        if (active && json?.success) {
          setSearchResults(json.data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => {active=false;clearTimeout(timer);};
  }, [searchQuery]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAccountDropOpen(false);
        setSearchOpen(false);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const DEFAULT_NAV = [
    { label: 'Shop', href: '/?page=shop' },
    { label: 'Our Story', href: '/?page=story' },
    { label: 'The Craft', href: '/?page=craft' },
    { label: 'Journal', href: '/?page=journal' },
    { label: 'Contact', href: '/?page=contact' },
  ];
  const navItems = settings?.navigation?.length ? settings.navigation : DEFAULT_NAV;

  const handleNavClick = (e, href) => {
    if (!href || href.startsWith('http://') || href.startsWith('https://')) return;
    e.preventDefault();
    setMobileDrawerOpen(false);
    try {
      const url = new URL(href, window.location.origin);
      const pageParam = url.searchParams.get('page');
      const cleanPath = url.pathname.replace(/^\//, '');
      const page = cleanPath === 'products' ? 'shop' : pageParam || cleanPath || 'home';
      const collection = url.searchParams.get('collection') || 'all';
      const category = url.searchParams.get('category') || 'all';
      navigate({ page, collection, category });
    } catch {
      navigate({ page: 'shop' });
    }
  };

  return (
    <>
      <header
        className={`site-header w-full ${scrolled ? 'scrolled' : ''}`}
        style={{
          borderBottom: scrolled ? '1px solid var(--line-khadi)' : '1px solid transparent',
        }}
      >
        <div className="rv-container h-full flex items-center justify-between">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="icon-btn mobile-menu-toggle"
              aria-label="Open mobile navigation"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'home' });
              }}
              className="flex items-center gap-3 select-none"
              aria-label="Rangvanat Home"
            >
              <img
                src={settings?.logo || '/images/logo-only.svg'}
                alt="Rangvanat Monogram"
                className="h-9 md:h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/logo-only.svg';
                }}
              />
            </a>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
            {navItems.map((n) => (
              <div key={n.href} className="relative group">
                <a
                  className="nav-link cursor-pointer"
                  href={n.href}
                  onClick={(e) => handleNavClick(e, n.href)}
                >
                  {n.label}
                </a>
                {/products|shop/.test(n.href) && collections.length > 0 && (
                  <div className="absolute top-full left-0 hidden group-hover:block group-focus-within:block bg-white shadow-lg border border-[var(--line-khadi)] rounded-[2px] p-4 min-w-56 z-50">
                    <p className="caption text-[var(--ink-soft)] text-xs mb-2 uppercase tracking-wider font-semibold">
                      Curated Edits
                    </p>
                    {collections.map((c) => (
                      <a
                        className="block py-1.5 text-xs text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] transition-colors cursor-pointer"
                        key={c.collectionId}
                        href={`/?page=shop&collection=${encodeURIComponent(c.collectionId)}`}
                        onClick={(e) =>
                          handleNavClick(e, `/?page=shop&collection=${encodeURIComponent(c.collectionId)}`)
                        }
                      >
                        {c.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="icon-btn"
              aria-label="Search collection"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropOpen((prev) => !prev)}
                className="icon-btn"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </button>

              {accountDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-[var(--shadow-dropdown)] border border-[var(--line-khadi)] rounded-[2px] p-3 z-50">
                  {customer ? (
                    <div>
                      <p className="text-[13px] text-[var(--ink-soft)] px-2 pt-1 pb-2">
                        Namaste, <strong className="text-[var(--brand-maroon)]">{customer.name.split(' ')[0]}</strong>
                      </p>
                      <div className="border-t border-[var(--line-khadi)] my-1" />
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'account', tab: 'orders' });
                        }}
                        className="w-full text-left px-3 py-2 text-[14px] hover:bg-[var(--bg-cream)] rounded-[2px]"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'account', tab: 'wishlist' });
                        }}
                        className="w-full text-left px-3 py-2 text-[14px] hover:bg-[var(--bg-cream)] rounded-[2px]"
                      >
                        My Wishlist
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'account', tab: 'addresses' });
                        }}
                        className="w-full text-left px-3 py-2 text-[14px] hover:bg-[var(--bg-cream)] rounded-[2px]"
                      >
                        Saved Addresses
                      </button>
                      <div className="border-t border-[var(--line-khadi)] my-1" />
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-[14px] text-[var(--state-error)] hover:bg-[var(--bg-cream)] rounded-[2px]"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'account', tab: 'login' });
                        }}
                        className="btn btn-primary btn-sm w-full mb-2"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'account', tab: 'register' });
                        }}
                        className="btn-ghost block text-center w-full text-[13px] mb-2"
                      >
                        Create an account
                      </button>
                      <div className="border-t border-[var(--line-khadi)] my-2" />
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'track' });
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-cream)] text-[var(--ink-chocolate)]"
                      >
                        Track an Order
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropOpen(false);
                          navigate({ page: 'faq' });
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-cream)] text-[var(--ink-chocolate)]"
                      >
                        Help & FAQ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => navigate({ page: 'account', tab: 'wishlist' })}
              className="icon-btn"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--brand-maroon)] text-[var(--bg-ivory)] text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Bag */}
            <button
              onClick={openCart}
              className="icon-btn"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--brand-maroon)] text-[var(--bg-ivory)] text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-ivory)]/95 backdrop-blur-md p-6 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-[var(--brand-maroon)]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by piece, motif, or collection..."
                className="w-full bg-transparent text-2xl font-serif italic text-[var(--ink-chocolate)] placeholder:text-[var(--ink-soft)] outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="icon-btn text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Quick Suggestions */}
            {!searchQuery && (
              <div>
                <p className="eyebrow text-[var(--ink-soft)] mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Peacock Khadi Saree', 'Indigo Co-ord Set', 'Patola Border', 'Raw Khadi Fabric', 'Bridal Dupatta'].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3.5 py-1.5 rounded-full bg-[var(--bg-cream)] text-[var(--ink-chocolate)] text-[13px] hover:bg-[var(--brand-maroon-tint)] hover:text-[var(--brand-maroon)] transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Live Search Results */}
            {searchQuery && (
              <div className="mt-6">
                <p className="eyebrow text-[var(--ink-soft)] mb-4">
                  {searching ? 'Searching the looms...' : `${searchResults.length} Results Found`}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {searchResults.map((item) => (
                    <div
                      key={item._id || item.slug}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate({ page: 'product', id: item.slug || item._id });
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[3/4] bg-[var(--bg-cream)] overflow-hidden mb-2">
                        <img
                          src={item.images?.[0]?.url || item.image || '/images/hero.png'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="font-medium text-[14px] text-[var(--ink-chocolate)] group-hover:text-[var(--brand-maroon)] truncate">
                        {item.title}
                      </p>
                      <p className="text-[13px] font-semibold text-[var(--brand-maroon)]">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      navigate({ page: 'shop', search: searchQuery });
                    }}
                    className="btn btn-primary btn-md"
                  >
                    View All Results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer (Design System §8) */}
      <div
        className={`drawer-backdrop ${mobileDrawerOpen ? 'open' : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 bottom-0 w-[86%] max-w-sm bg-[var(--bg-ivory)] z-70 shadow-2xl transition-transform duration-300 p-6 flex flex-col justify-between overflow-y-auto ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[var(--line-khadi)] mb-6">
            <span className="font-display text-2xl font-semibold tracking-wider text-[var(--brand-maroon)]">
              RANGVANAT
            </span>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="icon-btn"
              aria-label="Close navigation"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-4">
            {navItems.map((n) => (
              <a
                key={n.href}
                className="block nav-link text-base cursor-pointer"
                href={n.href}
                onClick={(e) => handleNavClick(e, n.href)}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom Mobile Drawer Actions */}
        <div className="pt-6 border-t border-[var(--line-khadi)] space-y-4">
          <button
            onClick={() => {
              setMobileDrawerOpen(false);
              navigate({ page: 'shop' });
            }}
            className="btn btn-primary btn-md w-full justify-center"
          >
            Shop All Collections
          </button>

          <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <span>Bardoli, Gujarat, India</span>
            <span>IN · INR (₹)</span>
          </div>
        </div>
      </div>
    </>
  );
}
