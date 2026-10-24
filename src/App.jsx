import { useState, useEffect, useCallback } from 'react';
import { StoreProvider } from './context/StoreContext.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ToastAlert from './components/ToastAlert.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import OurStoryPage from './pages/OurStoryPage.jsx';
import TheCraftPage from './pages/TheCraftPage.jsx';
import JournalPage from './pages/JournalPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

// Parse query params or pathname into route object
const parseRoute = () => {
  const url = new URL(window.location.href);
  const path = url.pathname.replace(/^\//, '');
  const params = url.searchParams;

  const pageParam = params.get('page');
  const page = pageParam || path || 'home';

  return {
    page,
    id: params.get('id') || '',
    collection: params.get('collection') || 'all',
    category: params.get('category') || 'all',
    search: params.get('search') || '',
    step: params.get('step') || 'spinning',
    tab: params.get('tab') || 'orders',
    orderNumber: params.get('orderNumber') || '',
    order: null,
  };
};

export default function App() {
  const [route, setRoute] = useState(() => parseRoute());

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom navigation handler with pushState
  const navigate = useCallback((target) => {
    const params = new URLSearchParams();

    if (target.page && target.page !== 'home') {
      params.set('page', target.page);
    }
    if (target.id) params.set('id', target.id);
    if (target.collection && target.collection !== 'all') params.set('collection', target.collection);
    if (target.category && target.category !== 'all') params.set('category', target.category);
    if (target.search) params.set('search', target.search);
    if (target.step) params.set('step', target.step);
    if (target.tab) params.set('tab', target.tab);
    if (target.orderNumber) params.set('orderNumber', target.orderNumber);

    const queryStr = params.toString() ? `?${params.toString()}` : '/';
    window.history.pushState(null, '', queryStr);
    setRoute({ ...target });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[var(--bg-ivory)] text-[var(--ink-chocolate)] font-sans antialiased selection:bg-[var(--brand-maroon-tint)] selection:text-[var(--brand-maroon-deep)]">
        {/* Top Announcement Bar (§7) */}
        <AnnouncementBar />

        {/* Global Navigation Header (§8) */}
        <Header currentRoute={route} navigate={navigate} />

        {/* Main Content Router */}
        <div className="flex-grow">
          {route.page === 'home' && <HomePage navigate={navigate} />}

          {(route.page === 'shop' || route.page === 'collections') && (
            <ShopPage
              key={`${route.collection}-${route.category}-${route.search}`}
              initialCollection={route.collection}
              initialCategory={route.category}
              initialSearch={route.search}
              navigate={navigate}
            />
          )}

          {route.page === 'product' && (
            <ProductDetailPage key={route.id} productId={route.id} navigate={navigate} />
          )}

          {route.page === 'cart' && <CartPage navigate={navigate} />}

          {route.page === 'checkout' && (
            <CheckoutPage
              navigate={navigate}
              onOrderComplete={(confirmedOrder) => {
                navigate({ page: 'order-confirmed', order: confirmedOrder });
              }}
            />
          )}

          {route.page === 'order-confirmed' && (
            <OrderConfirmationPage order={route.order} navigate={navigate} />
          )}

          {route.page === 'track' && (
            <OrderTrackingPage initialOrderNumber={route.orderNumber} navigate={navigate} />
          )}

          {route.page === 'story' && <OurStoryPage navigate={navigate} />}

          {route.page === 'craft' && <TheCraftPage initialStep={route.step} navigate={navigate} />}

          {route.page === 'journal' && <JournalPage navigate={navigate} />}

          {route.page === 'contact' && <ContactPage initialTopic={route.topic} navigate={navigate} />}

          {route.page === 'faq' && <FAQPage navigate={navigate} />}

          {route.page === 'account' && <AccountPage initialTab={route.tab} navigate={navigate} />}

          {/* 404 Fallback (§12.12) */}
          {![
            'home',
            'shop',
            'collections',
            'product',
            'cart',
            'checkout',
            'order-confirmed',
            'track',
            'story',
            'craft',
            'journal',
            'contact',
            'faq',
            'account',
          ].includes(route.page) && (
            <main id="main-content" className="rv-container py-24 text-center">
              <p className="serif-statement text-3xl text-[var(--ink-chocolate)] mb-2">
                "This thread ends here."
              </p>
              <h1 className="display-l text-[var(--brand-maroon)] mb-6 font-bold">404</h1>
              <div className="flex justify-center gap-4">
                <button onClick={() => navigate({ page: 'home' })} className="btn btn-primary btn-md">
                  Back to Home
                </button>
                <button onClick={() => navigate({ page: 'shop' })} className="btn btn-secondary btn-md">
                  Browse the Shop
                </button>
              </div>
            </main>
          )}
        </div>

        {/* Global Slide-in Cart Drawer (§11) */}
        <CartDrawer navigate={navigate} />

        {/* Global Toast Alert Notifications */}
        <ToastAlert />

        {/* Global Footer (§9) */}
        <Footer navigate={navigate} />
      </div>
    </StoreProvider>
  );
}
