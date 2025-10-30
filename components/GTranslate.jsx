"use client";
import { useEffect } from "react";

export default function GTranslate() {
  useEffect(() => {
    const getLangFromCookie = () => {
      const cookies = document.cookie.split(";").map((s) => s.trim());
      const keys = ["googtrans", "__gt_lang", "gtranslate", "gt_lang"];
      for (const k of keys) {
        const found = cookies.find((c) => c.startsWith(k + "="));
        if (found) {
          const v = decodeURIComponent(found.split("=")[1] || "");
          if (!v) continue;
          if (v.includes("/")) {
            const parts = v.split("/");
            for (let i = parts.length - 1; i >= 0; i--)
              if (parts[i]) return parts[i];
          }
          if (v.includes("|")) return v.split("|").pop();
          return v;
        }
      }
      return null;
    };

    const detectLang = () => {
      let lang = document.documentElement.getAttribute("lang") || null;
      if (lang) lang = lang.split("-")[0];

      const cookieLang = getLangFromCookie();
      if (cookieLang) lang = cookieLang.split("-")[0];

      const iframe = Array.from(document.querySelectorAll("iframe")).find((f) =>
        (f.src || "").includes("translate")
      );
      if (iframe && iframe.src) {
        const m = iframe.src.match(/\/([a-z]{2})(?:\/|$)/i);
        if (m) lang = m[1];
      }

      if (!lang) lang = (navigator.language || "en").split("-")[0];

      return lang;
    };

    const applyDirection = (lang) => {
      const short = (lang || "").toLowerCase().split("-")[0];
      const isRtl = ["ar", "he", "fa", "ur"].includes(short);
      if (isRtl) {
        document.documentElement.lang = "ar";
        document.documentElement.dir = "rtl";
        document.body.style.direction = "rtl";
      } else {
        document.documentElement.lang = "en";
        document.documentElement.dir = "ltr";
        document.body.style.direction = "ltr";
      }
    };

    window.gtranslateSettings = window.gtranslateSettings || {
      default_language: "en",
      native_language_names: true,
      detect_browser_language: true,
      languages: ["en", "ar"],
      wrapper_selector: ".gtranslate_wrapper",
      switcher_horizontal_position: "right",
      flag_style: "3d",
    };

    if (
      !document.querySelector(
        'script[src="https://cdn.gtranslate.net/widgets/latest/float.js"]'
      )
    ) {
      const s = document.createElement("script");
      s.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
      s.defer = true;
      document.body.appendChild(s);
    }

    let currentLang = null;
    const checkAndApply = () => {
      const lang = detectLang();
      if (lang !== currentLang) {
        currentLang = lang;
        applyDirection(lang);
      }
    };

    const t = setTimeout(checkAndApply, 800);
    const interval = setInterval(checkAndApply, 1000);

    const wrapper = document.querySelector(".gtranslate_wrapper");
    const onClick = () => setTimeout(checkAndApply, 600);
    if (wrapper) wrapper.addEventListener("click", onClick);

    return () => {
      clearTimeout(t);
      clearInterval(interval);
      if (wrapper) wrapper.removeEventListener("click", onClick);
    };
  }, []);

  return <div className="gtranslate_wrapper w-12 " />;
}
