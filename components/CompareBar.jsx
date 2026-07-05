"use client";

import { useCompare } from "./CompareContext";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiX, FiGrid } from "react-icons/fi";
import { useState } from "react";

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = i18n.language === "ar";
  const [isMinimized, setIsMinimized] = useState(false);

  // Do not render anything if there are no items, or if the user is on the compare page
  if (compareItems.length === 0 || pathname === "/compare") return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-6 ${
          isRTL ? "left-6" : "right-6"
        } z-50 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300`}
        title={t("compareNow") || "Compare Now"}
      >
        <FiGrid size={22} />
        {/* Count badge on top right */}
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
          {compareItems.length}
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slideUp"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        
        {/* Close/Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className={`absolute top-4 ${
            isRTL ? "left-4" : "right-4"
          } p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-colors`}
          title={t("close") || "Close"}
        >
          <FiX size={16} />
        </button>

        {/* Left section: count and list */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-bold text-gray-900 pr-6">
              {t("compareBarTitle") || "Compare"}: {compareItems.length}/4
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareItems.map((item) => (
              <div
                key={item._id}
                className="relative w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden group shadow-sm flex-shrink-0"
              >
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(item._id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-2xl transition-opacity duration-200"
                  title={t("removeFromCompare") || "Remove"}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right section: buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end pr-6">
          <button
            onClick={clearCompare}
            className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-xl"
          >
            {t("clearAll") || "Clear All"}
          </button>
          <button
            onClick={() => router.push("/compare")}
            className="btn btn-primary btn-sm rounded-xl px-5 hover:scale-105 transition-all shadow-md shadow-emerald-500/20"
          >
            {t("compareNow") || "Compare Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
