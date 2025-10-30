"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCartCount = async () => {
    if (!session) {
      setCartItemsCount(0);
      return;
    }

    try {
      const res = await fetch("/api/cart/count");
      if (res.ok) {
        const data = await res.json();
        setCartItemsCount(data.count || 0);
      }
    } catch (error) {}
  };

  const updateCartCount = async () => {
    await fetchCartCount();
  };

  useEffect(() => {
    fetchCartCount();
  }, [session]);

  const value = {
    cartItemsCount,
    updateCartCount,
    isLoading,
    setIsLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
