import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], _id: null });

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setCart({ items: [], _id: null });
      try {
        const { data } = await api.get('/cart');
        setCart(data);
      } catch {}
    };
    fetch();
  }, []);

  const updateCartUI = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {}
  };

  const addToCart = async (productId, qty = 1) => {
    if (!localStorage.getItem('token')) { toast.error('Please login first'); return; }
    try {
      await api.post('/cart/add', { productId, quantity: qty });
      toast.success('Added to cart');
      updateCartUI();
    } catch { toast.error('Failed to add'); }
  };

  const removeFromCart = async (productId) => {
    try { await api.put('/cart/update', { productId, quantity: 0 }); updateCartUI(); toast.success('Removed'); } catch { toast.error('Failed'); }
  };

  const total = cart.items.reduce((sum, item) => sum + (item.productId?.price * item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, total, updateCartUI }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);