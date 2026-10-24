import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/client.js';

export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return '₹' + Math.round(Number(amount)).toLocaleString('en-IN');
};

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // 1. Cart State with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('rv_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart to localStorage', e);
    }
  }, [cart]);

  // 2. Wishlist State with localStorage persistence
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('rv_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rv_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not persist wishlist to localStorage', e);
    }
  }, [wishlist]);

  // 3. Customer State with localStorage persistence and API sync
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('rv_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (customer) {
        localStorage.setItem('rv_customer', JSON.stringify(customer));
      } else {
        localStorage.removeItem('rv_customer');
      }
    } catch (e) {
      console.warn('Could not sync customer state with localStorage', e);
    }
  }, [customer]);

  // 4. Toast Alerts
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Sync customer session if token exists
  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    if (token) {
      api.getMe().then((res) => {
        if (res?.success && res.data) {
          setCustomer(res.data);
        }
      });
    }
  }, []);

  // Cart operations
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product, size = 'Standard', quantity = 1, customMeasurements = {}) => {
      if (!product) return;
      const id = product._id || product.id || product.slug || 'piece';
      const slug = product.slug || product.id || 'piece';
      const title = product.title || product.name || 'Handcrafted Khadi Piece';
      const price = Number(product.price) || 12500;
      const image =
        product.images?.[0]?.url ||
        product.image ||
        '/images/hero.png';
      const hasCustom = customMeasurements && Object.keys(customMeasurements).length > 0;
      const key = `${id}-${size}${hasCustom ? `-${JSON.stringify(customMeasurements)}` : ''}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.key === key);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + (quantity || 1),
          };
          return updated;
        }

        return [
          ...prev,
          {
            key,
            id,
            slug,
            title,
            image,
            price,
            size,
            quantity: Math.max(1, quantity || 1),
            customMeasurements: customMeasurements || {},
          },
        ];
      });

      setIsCartOpen(true);
      addToast(`Added "${title}" to your bag`, 'success');
    },
    [addToast]
  );

  const removeFromCart = useCallback(
    (key) => {
      setCart((prev) => prev.filter((item) => item.key !== key));
      addToast('Item removed from bag', 'info');
    },
    [addToast]
  );

  const updateQuantity = useCallback((key, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  }, [cart]);

  // Wishlist operations
  const isInWishlist = useCallback(
    (idOrSlug) => {
      if (!idOrSlug) return false;
      const target = String(idOrSlug).toLowerCase();
      return wishlist.some((item) => String(item).toLowerCase() === target);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      const idOrSlug =
        typeof product === 'string'
          ? product
          : product.slug || product._id || product.id;
      if (!idOrSlug) return;
      const key = String(idOrSlug);

      setWishlist((prev) => {
        const exists = prev.some((k) => String(k).toLowerCase() === key.toLowerCase());
        const updated = exists
          ? prev.filter((k) => String(k).toLowerCase() !== key.toLowerCase())
          : [...prev, key];
        addToast(
          exists ? 'Removed from wishlist' : 'Saved to wishlist',
          exists ? 'info' : 'success'
        );
        return updated;
      });
    },
    [addToast]
  );

  // Authentication operations
  const login = useCallback(
    async (email, password) => {
      try {
        const res = await api.login({ email, password });
        if (res?.success && res.data) {
          if (res.data.token) {
            localStorage.setItem('rv_token', res.data.token);
          }
          const cust = res.data.customer || res.data;
          setCustomer(cust);
          addToast(`Welcome back, ${cust.name || 'patron'}!`, 'success');
          return { success: true, customer: cust };
        }
        const message = res?.message || 'Invalid email or password';
        addToast(message, 'error');
        return { success: false, message };
      } catch (err) {
        addToast('Login error. Please try again.', 'error');
        return { success: false, message: err.message };
      }
    },
    [addToast]
  );

  const register = useCallback(
    async (name, email, password, phone) => {
      try {
        const res = await api.register({ name, email, password, phone });
        if (res?.success && res.data) {
          if (res.data.token) {
            localStorage.setItem('rv_token', res.data.token);
          }
          const cust = res.data.customer || res.data;
          setCustomer(cust);
          addToast(`Welcome to Rangvanat, ${cust.name}!`, 'success');
          return { success: true, customer: cust };
        }
        const message = res?.message || 'Could not create account';
        addToast(message, 'error');
        return { success: false, message };
      } catch (err) {
        addToast('Registration error. Please try again.', 'error');
        return { success: false, message: err.message };
      }
    },
    [addToast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('rv_token');
    localStorage.removeItem('rv_customer');
    setCustomer(null);
    addToast('Signed out of atelier session', 'info');
  }, [addToast]);

  const value = {
    // Cart
    cart,
    cartCount,
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Wishlist
    wishlist,
    isInWishlist,
    toggleWishlist,

    // Customer
    customer,
    setCustomer,
    login,
    register,
    logout,

    // Toasts
    toasts,
    addToast,
    removeToast,

    // Utilities
    formatPrice,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export default StoreContext;
