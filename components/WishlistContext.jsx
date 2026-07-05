"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session, status: sessionStatus } = useSession();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist");
      setWishlistItems(data.products || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [sessionStatus]);

  const toggleWishlist = async (product) => {
    if (sessionStatus !== "authenticated") {
      toast.error(t("pleaseSignInToAddToWishlist") || "Please sign in to manage wishlist");
      return;
    }

    const productId = typeof product === "object" ? product._id : product;
    const isAlreadyWishlisted = wishlistItems.some((item) => (item._id || item) === productId);

    try {
      if (isAlreadyWishlisted) {
        await axios.delete(`/api/wishlist/${productId}`);
        setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
        toast.success(t("removedFromWishlist") || "Removed from wishlist");
      } else {
        await axios.post("/api/wishlist", { productId });
        setWishlistItems((prev) => [...prev, product]);
        toast.success(t("addedToWishlist") || "Added to wishlist");
      }
    } catch (error) {
      toast.error(t("failedToUpdateWishlist") || "Failed to update wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
