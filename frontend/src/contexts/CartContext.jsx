import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cart_items';

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage might be full or unavailable
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(loadCartFromStorage);
  const [syncing, setSyncing] = useState(false);

  // Sync with backend when user logs in
  useEffect(() => {
    if (user) {
      syncWithBackend();
    }
  }, [user]);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const syncWithBackend = async () => {
    try {
      setSyncing(true);
      const response = await api.get('/cart');
      if (response.data && Array.isArray(response.data.items)) {
        setItems(response.data.items);
      }
    } catch (error) {
      // If backend sync fails, keep local cart
      console.warn('Cart sync failed, using local storage:', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const pushCartToBackend = useCallback(async (updatedItems) => {
    if (!user) return;
    try {
      await api.put('/cart', { items: updatedItems });
    } catch (error) {
      console.warn('Cart push to backend failed:', error.message);
    }
  }, [user]);

  /**
   * Add a product to the cart
   * @param {object} product - Product object
   * @param {number} quantity - Quantity to add
   * @param {boolean} isWholesale - Whether this is a wholesale purchase
   */
  const addToCart = useCallback((product, quantity = 1, isWholesale = false) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product._id && item.isWholesale === isWholesale
      );

      let updated;
      if (existingIndex >= 0) {
        updated = prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            productId: product._id,
            product,
            quantity,
            isWholesale,
          },
        ];
      }

      pushCartToBackend(updated);
      return updated;
    });
  }, [pushCartToBackend]);

  /**
   * Remove a product from the cart
   * @param {string} productId - Product ID to remove
   * @param {boolean} [isWholesale] - If provided, only removes matching type
   */
  const removeFromCart = useCallback((productId, isWholesale = null) => {
    setItems((prev) => {
      const updated = prev.filter((item) => {
        if (item.productId !== productId) return true;
        if (isWholesale !== null) return item.isWholesale !== isWholesale;
        return false;
      });
      pushCartToBackend(updated);
      return updated;
    });
  }, [pushCartToBackend]);

  /**
   * Update the quantity of a cart item
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @param {boolean} [isWholesale] - Type of purchase
   */
  const updateQuantity = useCallback((productId, quantity, isWholesale = null) => {
    if (quantity < 1) {
      removeFromCart(productId, isWholesale);
      return;
    }

    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.productId !== productId) return item;
        if (isWholesale !== null && item.isWholesale !== isWholesale) return item;
        return { ...item, quantity };
      });
      pushCartToBackend(updated);
      return updated;
    });
  }, [removeFromCart, pushCartToBackend]);

  /**
   * Clear all items from the cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    pushCartToBackend([]);
  }, [pushCartToBackend]);

  // Computed values
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const total = items.reduce((sum, item) => {
    const price = item.isWholesale
      ? (item.product?.wholesalePrice ?? item.product?.price ?? 0)
      : (item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        syncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
