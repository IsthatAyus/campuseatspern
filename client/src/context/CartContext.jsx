import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('campuseats_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campuseats_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) => ci.menu_item_id === item.id && ci.restaurant_id === item.restaurant_id
      );
      if (existing) {
        return prev.map((ci) =>
          ci.menu_item_id === item.id && ci.restaurant_id === item.restaurant_id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          description: item.description,
          image: item.image,
        },
      ];
    });
  };

  const updateQuantity = (menu_item_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menu_item_id);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.menu_item_id === menu_item_id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (menu_item_id) => {
    setCartItems((prev) => prev.filter((item) => item.menu_item_id !== menu_item_id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
