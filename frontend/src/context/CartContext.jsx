import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import { useLoginPrompt } from './LoginPromptContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], _id: null });
  const { showLoginPrompt } = useLoginPrompt();

  useEffect(() => {
    const fetchCart = async () => {
      if (!auth.currentUser) return setCart({ items: [], _id: null });
      try {
        const { data } = await api.get('/cart');
        setCart(data);
      } catch {}
    };
    fetchCart();
  }, []);

  const updateCartUI = async () => {
    if (!auth.currentUser) return;
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {}
  };

  const addToCart = async (productId, qty = 1) => {
    if (!auth.currentUser) { showLoginPrompt('Login to add items to your cart'); return; }
    try {
      await api.post('/cart/add', { productId, quantity: qty });
      toast.success('Added to cart');
      updateCartUI();
    } catch { toast.error('Failed to add'); }
  };

  const removeFromCart = async (productId) => {
    try { await api.put('/cart/update', { productId, quantity: 0 }); updateCartUI(); toast.success('Removed'); } catch { toast.error('Failed'); }
  };

  const total = useMemo(() =>
    cart.items.reduce((sum, item) => sum + (item.productId?.price * item.quantity || 0), 0),
    [cart.items]
  );

  const value = useMemo(() => ({ cart, addToCart, removeFromCart, total, updateCartUI }), [cart, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);