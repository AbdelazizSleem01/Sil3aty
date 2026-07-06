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

  const convertPrice = (usdAmount) => {
    const amount = Number(usdAmount) || 0;
    const current = CURRENCIES[currency];
    return amount * current.rate;
  };

  const formatPrice = (usdAmount) => {
    const amount = Number(usdAmount) || 0;
    const current = CURRENCIES[currency];
    const converted = amount * current.rate;
    const symbol = isRTL ? current.symbolAr : current.symbolEn;
    
    if (currency === "USD") {
      return `${symbol}${converted.toFixed(2)}`;
    }
    return isRTL ? `${converted.toFixed(2)} ${symbol}` : `${symbol} ${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencies: Object.values(CURRENCIES),
        changeCurrency,
        convertPrice,
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
