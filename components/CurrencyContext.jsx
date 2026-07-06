"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CurrencyContext = createContext();

const CURRENCIES = {
  USD: { code: "USD", symbolEn: "$", symbolAr: "$", rate: 1 },
  EGP: { code: "EGP", symbolEn: "EGP", symbolAr: "ج.م", rate: 50.0 },
  SAR: { code: "SAR", symbolEn: "SAR", symbolAr: "ر.س", rate: 3.75 },
  AED: { code: "AED", symbolEn: "AED", symbolAr: "د.إ", rate: 3.67 },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrency(code);
      localStorage.setItem("selectedCurrency", code);
    }
  };

  const getProductPrice = (product, isDiscount = false) => {
    if (!product) return 0;
    if (currency === "USD") {
      const discountVal = typeof product.discountPrice === "number" ? product.discountPrice : product.price;
      return isDiscount ? discountVal : product.price;
    }
    const field = isDiscount ? `discountPrice${currency}` : `price${currency}`;
    if (typeof product[field] === "number" && product[field] > 0) {
      return product[field];
    }
    // Fallback to rate conversion
    const discountVal = typeof product.discountPrice === "number" ? product.discountPrice : product.price;
    const baseVal = isDiscount ? discountVal : product.price;
    const current = CURRENCIES[currency];
    return baseVal * current.rate;
  };

  const formatPrice = (usdAmount, product = null, type = "price", isPreConverted = false) => {
    const current = CURRENCIES[currency];
    const symbol = isRTL ? current.symbolAr : current.symbolEn;
    
    let finalAmount = Number(usdAmount) || 0;

    if (!isPreConverted) {
      if (product && currency !== "USD") {
        if (type === "price") {
          finalAmount = getProductPrice(product, false);
        } else if (type === "discount") {
          finalAmount = getProductPrice(product, true);
        } else if (type === "diff") {
          const pr = getProductPrice(product, false);
          const dp = getProductPrice(product, true);
          finalAmount = Math.max(0, pr - dp);
        } else {
          finalAmount = finalAmount * current.rate;
        }
      } else {
        if (currency !== "USD") {
          finalAmount = finalAmount * current.rate;
        }
      }
    }

    if (currency === "USD") {
      return `${symbol}${finalAmount.toFixed(2)}`;
    }
    return isRTL ? `${finalAmount.toFixed(2)} ${symbol}` : `${symbol} ${finalAmount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencies: Object.values(CURRENCIES),
        changeCurrency,
        getProductPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
