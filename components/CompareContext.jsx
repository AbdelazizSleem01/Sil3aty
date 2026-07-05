"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);
  const { t } = useTranslation();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compareItems");
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (e) {
        setCompareItems([]);
      }
    }
  }, []);

  const saveToStorage = (items) => {
    localStorage.setItem("compareItems", JSON.stringify(items));
  };

  const addToCompare = (product) => {
    if (compareItems.some((item) => item._id === product._id)) {
      toast.info(t("alreadyInCompare") || "Product already in compare list");
      return;
    }
    if (compareItems.length >= 4) {
      toast.warning(t("compareLimitReached") || "You can only compare up to 4 products");
      return;
    }
    const updated = [...compareItems, product];
    setCompareItems(updated);
    saveToStorage(updated);
    toast.success(t("addedToCompareSuccess") || "Added to compare list successfully");
  };

  const removeFromCompare = (productId) => {
    const updated = compareItems.filter((item) => item._id !== productId);
    setCompareItems(updated);
    saveToStorage(updated);
  };

  const clearCompare = () => {
    setCompareItems([]);
    saveToStorage([]);
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
