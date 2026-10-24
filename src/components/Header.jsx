import { useState, useEffect, useRef } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function Header({ currentRoute, navigate }) {
  const { cartCount, wishlist, openCart, customer, logout } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [shopMegaOpen, setShopMegaOpen] = useState(false);
  const [craftDropOpen, setCraftDropOpen] = useState(false);
  const [accountDropOpen, setAccountDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileCraftOpen, setMobileCraftOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const shopMegaTimer = useRef(null);

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
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=4`);
        const json = await res.json();
        if (json?.success) {
          setSearchResults(json.data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShopMegaOpen(false);
        setCraftDropOpen(false);
        setAccountDropOpen(false);
        setSearchOpen(false);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShopEnter = () => {
    clearTimeout(shopMegaTimer.current);
    shopMegaTimer.current = setTimeout(() => {
      setShopMegaOpen(true);
      setCraftDropOpen(false);
    }, 150);
  };

  const handleShopLeave = () => {
    clearTimeout(shopMegaTimer.current);
    shopMegaTimer.current = setTimeout(() => {
      setShopMegaOpen(false);
    }, 200);
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
                src="/images/full-logo.svg"
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
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'home' });
              }}
              className={`nav-link ${currentRoute.page === 'home' ? 'active' : ''}`}
            >
              Home
            </a>

            {/* Shop with Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleShopEnter}
              onMouseLeave={handleShopLeave}
            >
              <button
                onClick={() => navigate({ page: 'shop' })}
                className={`nav-link flex items-center gap-1 bg-transparent border-none cursor-pointer ${
                  currentRoute.page === 'shop' ? 'active' : ''
                }`}
              >
                Shop
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>

              {shopMegaOpen && (
                <div
                  className="fixed left-0 right-0 top-[72px] bg-white border-t border-[var(--line-khadi)] shadow-[var(--shadow-dropdown)] py-8 z-50 transition-all duration-200"
                  style={{ top: scrolled ? '60px' : '72px' }}
                >
                  <div className="rv-container grid grid-cols-5 gap-8">
                    {/* Col 1: Categories */}
                    <div>
                      <p className="eyebrow text-[var(--ink-soft)] mb-4">Categories</p>
                      <ul className="space-y-2.5 list-none p-0 m-0">
                        {['Sarees', 'Dupattas & Stoles', 'Fabrics by Metre', 'Co-ord Sets', 'Dresses', 'Jackets'].map(
                          (cat) => (
                            <li key={cat}>
                              <a
                                href={`/shop?category=${encodeURIComponent(cat)}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShopMegaOpen(false);
                                  navigate({ page: 'shop', category: cat });
                                }}
                                className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block transition-transform duration-150 hover:translate-x-1"
                              >
                                {cat}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Col 2: Curated Edits */}
                    <div>
                      <p className="eyebrow text-[var(--ink-soft)] mb-4">Curated Edits</p>
                      <ul className="space-y-2.5 list-none p-0 m-0">
                        {[
                          { id: 'flora', name: 'The Flora Edit' },
                          { id: 'sacred', name: 'The Sacred Edit' },
                          { id: 'folk', name: 'The Folk Edit' },
                          { id: 'heritage', name: 'The Heritage Edit' },
                          { id: 'denim', name: 'The Denim Edit' },
                          { id: 'modern', name: 'The Modern Edit' },
                        ].map((edit) => (
                          <li key={edit.id}>
                            <a
                              href={`/shop?collection=${edit.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setShopMegaOpen(false);
                                navigate({ page: 'shop', collection: edit.id });
                              }}
                              className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block transition-transform duration-150 hover:translate-x-1"
                            >
                              {edit.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 3: By Craft */}
                    <div>
                      <p className="eyebrow text-[var(--ink-soft)] mb-4">By Craft</p>
                      <ul className="space-y-2.5 list-none p-0 m-0">
                        {['Artisan Hand Spun', 'Natural Indigo Dye', 'Pit Loom Woven', 'Block Printed Border'].map((craft) => (
                          <li key={craft}>
                            <a
                              href="/craft"
                              onClick={(e) => {
                                e.preventDefault();
                                setShopMegaOpen(false);
                                navigate({ page: 'craft' });
                              }}
                              className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block transition-transform duration-150 hover:translate-x-1"
                            >
                              {craft}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 4: Help Me Choose */}
                    <div>
                      <p className="eyebrow text-[var(--ink-soft)] mb-4">Services</p>
                      <ul className="space-y-2.5 list-none p-0 m-0">
                        <li>
                          <a
                            href="/contact"
                            onClick={(e) => {
                              e.preventDefault();
                              setShopMegaOpen(false);
                              navigate({ page: 'contact', topic: 'Video Consultation' });
                            }}
                            className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block"
                          >
                            Book a Video Call
                          </a>
                        </li>
                        <li>
                          <a
                            href="/contact"
                            onClick={(e) => {
                              e.preventDefault();
                              setShopMegaOpen(false);
                              navigate({ page: 'contact' });
                            }}
                            className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block"
                          >
                            Customer & Order Support
                          </a>
                        </li>
                        <li>
                          <a
                            href="/faq"
                            onClick={(e) => {
                              e.preventDefault();
                              setShopMegaOpen(false);
                              navigate({ page: 'faq' });
                            }}
                            className="text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] block"
                          >
                            Care & Sizing Guide
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Col 5: Editorial Feature Card */}
                    <div className="bg-[var(--bg-cream)] p-4 flex flex-col justify-between rounded-[2px] relative overflow-hidden">
                      <img
                        src="/images/bridal-edit.jpg"
                        alt="The Bridal Edit"
                        className="w-full h-36 object-cover mb-3"
                      />
                      <p className="serif-statement text-[17px] text-[var(--ink-chocolate)] mb-2">
                        "Every thread spun by human hands carries a pulse."
                      </p>
                      <button
                        onClick={() => {
                          setShopMegaOpen(false);
                          navigate({ page: 'shop', collection: 'heritage' });
                        }}
                        className="btn-ghost text-left text-[13px] font-semibold text-[var(--brand-maroon)]"
                      >
                        Explore Heritage Edit →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a
              href="/story"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'story' });
              }}
              className={`nav-link ${currentRoute.page === 'story' ? 'active' : ''}`}
            >
              Our Story
            </a>

            {/* The Craft Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCraftDropOpen(true)}
              onMouseLeave={() => setCraftDropOpen(false)}
            >
              <button
                onClick={() => navigate({ page: 'craft' })}
                className={`nav-link flex items-center gap-1 bg-transparent border-none cursor-pointer ${
                  currentRoute.page === 'craft' ? 'active' : ''
                }`}
              >
                The Craft
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>

              {craftDropOpen && (
                <div className="absolute left-0 top-full w-56 bg-white shadow-[var(--shadow-dropdown)] border border-[var(--line-khadi)] rounded-[2px] py-2 z-50">
                  {[
                    { key: 'spinning', label: '1. Hand Spinning' },
                    { key: 'dyeing', label: '2. Natural Dyeing' },
                    { key: 'weaving', label: '3. Pit Loom Weaving' },
                    { key: 'finishing', label: '4. Block Finishing' },
                    { key: 'artisans', label: 'Meet the Artisans' },
                  ].map((item) => (
                    <a
                      key={item.key}
                      href={`/craft?step=${item.key}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCraftDropOpen(false);
                        navigate({ page: 'craft', step: item.key });
                      }}
                      className="block px-4 py-2.5 text-[14px] text-[var(--ink-chocolate)] hover:bg-[var(--bg-cream)] hover:text-[var(--brand-maroon)] transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/journal"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'journal' });
              }}
              className={`nav-link ${currentRoute.page === 'journal' ? 'active' : ''}`}
            >
              Journal
            </a>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'contact' });
              }}
              className={`nav-link ${currentRoute.page === 'contact' ? 'active' : ''}`}
            >
              Contact
            </a>
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
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate({ page: 'home' });
              }}
              className="heading-2 block w-full text-left text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
            >
              Home
            </button>

            {/* Shop Accordion */}
            <div>
              <button
                onClick={() => setMobileShopOpen((prev) => !prev)}
                className="heading-2 flex items-center justify-between w-full text-left text-[var(--ink-chocolate)]"
              >
                <span>Shop</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-200 ${mobileShopOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileShopOpen && (
                <div className="pl-4 pt-3 pb-2 space-y-2 border-l-2 border-[var(--brand-gold)] mt-2">
                  {['All Pieces', 'Sarees', 'Dupattas & Stoles', 'Fabrics', 'Co-ord Sets', 'Dresses'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate({ page: 'shop', category: cat === 'All Pieces' ? 'all' : cat });
                      }}
                      className="block text-left text-[15px] text-[var(--ink-soft)] hover:text-[var(--brand-maroon)]"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate({ page: 'story' });
              }}
              className="heading-2 block w-full text-left text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
            >
              Our Story
            </button>

            {/* The Craft Accordion */}
            <div>
              <button
                onClick={() => setMobileCraftOpen((prev) => !prev)}
                className="heading-2 flex items-center justify-between w-full text-left text-[var(--ink-chocolate)]"
              >
                <span>The Craft</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-200 ${mobileCraftOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileCraftOpen && (
                <div className="pl-4 pt-3 pb-2 space-y-2 border-l-2 border-[var(--brand-gold)] mt-2">
                  {['Spinning', 'Dyeing', 'Weaving', 'Finishing', 'Artisans'].map((step) => (
                    <button
                      key={step}
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate({ page: 'craft', step: step.toLowerCase() });
                      }}
                      className="block text-left text-[15px] text-[var(--ink-soft)] hover:text-[var(--brand-maroon)]"
                    >
                      {step}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate({ page: 'journal' });
              }}
              className="heading-2 block w-full text-left text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
            >
              Journal
            </button>

            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate({ page: 'contact' });
              }}
              className="heading-2 block w-full text-left text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
            >
              Contact
            </button>
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
