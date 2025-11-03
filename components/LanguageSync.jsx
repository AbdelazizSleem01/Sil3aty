"use client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const storedLang = localStorage.getItem("i18nextLng");

    if (storedLang && storedLang !== i18n.language && ["en", "ar"].includes(storedLang)) {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  return null;
}
