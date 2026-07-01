"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const { data: cartCountData, mutate: mutateCartCount } = useSWR(
    session ? "/api/cart/count" : null
  );

  const cartItemsCount = cartCountData?.count || 0;

  const updateCartCount = async () => {
    await mutateCartCount();
  };

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
