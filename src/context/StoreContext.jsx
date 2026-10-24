import { useState, useEffect, useCallback, useMemo } from 'react';
import { readArray, validCartLine } from '../lib/commerce';
import { api } from '../api/client.js';

import StoreContext, {formatPrice} from './store';

export function StoreProvider({ children }) {
  // 1. Cart State with localStorage persistence
  const [cart, setCart] = useState(() => readArray('rv_cart',validCartLine));
  const [couponCode,setCouponCode]=useState(()=>localStorage.getItem('rv_coupon')||'');
  useEffect(()=>{localStorage.setItem('rv_coupon',couponCode);},[couponCode]);
  const [settings,setSettings]=useState(null);
  useEffect(()=>{api.settings().then(r=>{if(r.success)setSettings(r.data);});},[]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('rv_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart to localStorage', e);
    }
  }, [cart]);

  // 2. Wishlist State with localStorage persistence
  const [wishlist, setWishlist] = useState(() => readArray('rv_wishlist',i=>typeof i==='string'));

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

  const refreshCustomer = useCallback(async () => {
    if(!localStorage.getItem('rv_token')) return;
    const res=await api.getMe();
    if(res.success){setCustomer(res.data);setWishlist(res.data.wishlist||[]);}
    else if(res.status===401||res.status===403){localStorage.removeItem('rv_token');setCustomer(null);}
  },[]);
  useEffect(()=>{queueMicrotask(refreshCustomer);const sync=e=>{if(e.key==='rv_cart')setCart(readArray('rv_cart',validCartLine));if(e.key==='rv_wishlist')setWishlist(readArray('rv_wishlist',i=>typeof i==='string'));};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[refreshCustomer]);
  // Cart operations
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product, size = 'Standard', quantity = 1, customMeasurements = {}) => {
      if (!product) return;
      const id = product._id || product.id || product.slug || 'piece';
      const slug = product.slug || product.id || 'piece';
      const title = product.title || product.name || 'Handcrafted Khadi Piece';
      const variant=product.variants?.find(v=>v.size===size);
      if(!variant || product.salesPaused || (!product.madeToOrder && variant.stock<quantity)){addToast('This size or quantity is unavailable','error');return;}
      if(size==='Custom' && !customMeasurements.bust && !customMeasurements.waist && !customMeasurements.notes){addToast('Add custom measurements first','error');return;}
      const price = Number(product.price) + Number(variant.priceDelta||0);
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
            quantity: Math.min(product.madeToOrder?99:Math.min(99,variant.stock),updated[existingIndex].quantity + (quantity || 1)),
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
            quantity: Math.min(99,Math.max(1, quantity || 1)),
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
            const nextQty = Math.min(99,item.quantity + delta);
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCouponCode('');
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

  const toggleWishlist = useCallback(async product => {
    const key=typeof product==='string'?product:product.slug||product._id||product.id;
    if(!key)return;
    const exists=wishlist.includes(key);const updated=exists?wishlist.filter(k=>k!==key):[...wishlist,key];
    if(customer){const res=await api.updateProfile({wishlist:updated});if(!res.success){addToast(res.message,'error');return;}}
    setWishlist(updated);addToast(exists?'Removed from wishlist':'Saved to wishlist','success');
  },[wishlist,customer,addToast]);

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
          await refreshCustomer();
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
    [addToast,refreshCustomer]
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
          await refreshCustomer();
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
    [addToast,refreshCustomer]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('rv_token');
    localStorage.removeItem('rv_customer');
    setCustomer(null);
    setWishlist([]);
    addToast('Signed out of atelier session', 'info');
  }, [addToast]);

  const value = {
    settings,couponCode,setCouponCode,refreshCustomer,
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

