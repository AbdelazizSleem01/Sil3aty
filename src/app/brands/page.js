"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FaIndustry,
  FaSpinner,
  FaExclamationTriangle,
  FaTag,
  FaArrowRight,
} from "react-icons/fa";
import Image from "next/image";

import useSWR from "swr";

export default function BrandsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const router = useRouter();

  const { data: brandsData, error: brandsError } = useSWR("/api/brands");

  const brands = brandsData || [];
  const loading = !brandsData && !brandsError;
  const error = brandsError ? brandsError.message : "";

  // Helper to translate labels in the description dynamically
  const translateDescription = (desc) => {
    if (!desc) return "";
    if (isRTL) {
      return desc
        .replace(/Brand Identity:/gi, "هوية العلامة التجارية:")
        .replace(/Target Audience:/gi, "الجمهور المستهدف:");
    }
    return desc;
  };

  // Repeat brands to ensure smooth infinite loop
  const repeatedBrands = [];
  const repeatCount = 6; // Repeat 6 times to have plenty of items for any screen size
  if (brands.length > 0) {
    for (let i = 0; i < repeatCount; i++) {
      repeatedBrands.push(...brands);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 bg-base-100">
        <FaExclamationTriangle className="text-6xl mb-4 text-red-400" />
        <h2 className="text-2xl font-bold mb-2">{t("errorLoadingBrands")}</h2>
        <p className="text-lg">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-primary"
        >
          <FaSpinner className="mr-2" />
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-8 py-12">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaSpinner className="text-6xl text-primary animate-spin mb-4" />
            <p className="text-gray-600 text-xl flex items-center gap-2">
              <FaTag className="text-primary" />
              {t("loadingBrands")}
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-16">
              <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-2 sm:gap-3 mb-4 mx-auto px-2">
                <FaIndustry className="text-3xl sm:text-4xl md:text-5xl text-primary" />
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
                  {t("ourPremiumBrands")}
                </h2>
              </div>

              <div className="relative overflow-hidden py-8" dir="ltr">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

                <div className="flex animate-brands-marquee gap-6 items-center hover:pause-scroll">
                  {repeatedBrands.map((brand, index) => (
                    <Link
                      key={brand._id + "-" + index}
                      href={`/product?brand=${brand._id}`}
                      className="group flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-emerald-200 hover:scale-105"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 mb-4 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                          {brand.logo ? (
                            <img
                              loading="lazy"
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <FaIndustry className="w-full h-full text-gray-400 object-contain group-hover:text-emerald-500 transition-colors duration-500" />
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-500">
                          {brand.name}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {translateDescription(brand.description)}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                          {t("viewProducts")}
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/product?brand=${brand._id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-emerald-200"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-3 relative bg-gray-50 rounded-lg p-2 group-hover:bg-emerald-50 transition-colors">
                        {brand.logo ? (
                          <Image
                            loading="lazy"
                            src={brand.logo}
                            alt={brand.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <FaIndustry className="w-full h-full text-gray-400 object-contain" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {translateDescription(brand.description)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && brands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaIndustry className="text-8xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              {t("noBrandsFound")}
            </h3>
            <p className="text-gray-500 max-w-md">{t("noBrandsAvailable")}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scrollBrands {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${100 / repeatCount}%);
          }
        }
        .animate-brands-marquee {
          display: flex;
          width: max-content;
          animation: scrollBrands 35s linear infinite;
        }
        .hover\\:pause-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
