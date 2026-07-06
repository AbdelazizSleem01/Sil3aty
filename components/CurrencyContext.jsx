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
    // Always auto-detect country and currency on first load to bypass any cached stale values
    const autoDetectCurrency = async () => {
      let detectedCode = "USD";

      // Step 1: Detect via Browser Locale (Instant)
      try {
        const locale = navigator.language || (navigator.languages && navigator.languages[0]) || "";
        if (locale) {
          const upperLocale = locale.toUpperCase();
          if (upperLocale.includes("-EG") || upperLocale.includes("_EG") || upperLocale === "EG") {
            detectedCode = "EGP";
          } else if (upperLocale.includes("-SA") || upperLocale.includes("_SA") || upperLocale === "SA") {
            detectedCode = "SAR";
          } else if (upperLocale.includes("-AE") || upperLocale.includes("_AE") || upperLocale === "AE") {
            detectedCode = "AED";
          }
        }
      } catch (err) {}

      // Step 2: Detect via Timezone (Instant fallback)
      if (detectedCode === "USD") {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) {
            if (tz.includes("Cairo")) {
              detectedCode = "EGP";
            } else if (tz.includes("Riyadh") || tz.includes("Asia/Kuwait") || tz.includes("Asia/Qatar")) {
              detectedCode = "SAR";
            } else if (tz.includes("Dubai") || tz.includes("Abu_Dhabi")) {
              detectedCode = "AED";
            }
          }
        } catch (err) {}
      }

      // Set currency instantly
      setCurrency(detectedCode);

      // Step 3: Detect via GeoIP (Highly precise, asynchronous)
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const country = data.country_code; // e.g. "EG", "SA", "AE"
          if (country === "EG") {
            setCurrency("EGP");
          } else if (country === "SA") {
            setCurrency("SAR");
          } else if (country === "AE") {
            setCurrency("AED");
          } else {
            setCurrency("USD");
          }
        }
      } catch (err) {
        // Keep whatever locale/timezone detected
      }
    };

    autoDetectCurrency();
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
