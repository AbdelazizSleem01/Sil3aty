"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  Tag,
  Zap,
  Clock,
  Star,
  Filter,
  ArrowUpDown,
  AlertCircleIcon,
} from "lucide-react";
import { useCart } from "../../../components/CartContext";
import { useCompare } from "../../../components/CompareContext";
import { useWishlist } from "../../../components/WishlistContext";
import { useCurrency } from "../../../components/CurrencyContext";
import { FiGrid, FiHeart } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function DiscountedProductsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { updateCartCount } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [animatingProductId, setAnimatingProductId] = useState(null);
  const [sortBy, setSortBy] = useState("discountPercentage");
  const [filterBy, setFilterBy] = useState("");

  const { data: allProducts, error: productsError } = useSWR("/api/products");

  const discountedProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(
      (product) =>
        product.discountPrice &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price
    );
  }, [allProducts]);

  const loading = !allProducts && !productsError;

  const filteredProducts = useMemo(() => {
    let products = [...discountedProducts];

    if (sortBy === "discountPercentage") {
      products.sort((a, b) => {
        const aPercent =
          a.discountPercentage ||
          calculateDiscountPercentage(a.price, a.discountPrice);
        const bPercent =
          b.discountPercentage ||
          calculateDiscountPercentage(b.price, b.discountPrice);
        return bPercent - aPercent;
      });
    } else if (sortBy === "endDate") {
      products.sort((a, b) => {
        const aDate = a.discountEndDate
          ? new Date(a.discountEndDate)
          : new Date(3000, 0, 1);
        const bDate = b.discountEndDate
          ? new Date(b.discountEndDate)
          : new Date(3000, 0, 1);
        return aDate - bDate;
      });
    }

    if (filterBy) {
      products = products.filter((product) => {
        const percentage =
          product.discountPercentage ||
          calculateDiscountPercentage(product.price, product.discountPrice);
        if (filterBy === "high") return percentage >= 50;
        if (filterBy === "medium") return percentage >= 30 && percentage < 50;
        if (filterBy === "low") return percentage < 30;
        return true;
      });
    }

    return products;
  }, [discountedProducts, sortBy, filterBy]);

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          size: "M",
          color: "Black",
        }),
      });

      if (!response.ok) throw new Error("Failed to add product to cart");

      toast.success(t("productAddedToCart"));
      await updateCartCount();
      setAnimatingProductId(productId);
      setTimeout(() => setAnimatingProductId(null), 500);
    } catch (error) {
      toast.error(t("failedToAddToCart"));
    }
  };

  const calculateDiscountPercentage = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const getDiscountIntensity = (percentage) => {
    if (percentage >= 50) return "high";
    if (percentage >= 30) return "medium";
    return "low";
  };

  return (
    <section
      className={`min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 md:py-12 lg:py-16 ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <div className="container mx-auto ">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <h1 className="relative text-5xl md:text-6xl pb-2 font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              {t("flashSale")}
            </h1>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">🔥</span>
            <p className="text-xl text-gray-700 font-semibold">
              {t("limitedTimeOffers")}
            </p>
            <Clock className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("dontMissDeals")}
          </p>
        </div>

        {discountedProducts.length > 0 && (
          <div className="mb-12 flex flex-col lg:flex-row gap-6 justify-center items-center bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                {t("filterByDiscount")}:
              </span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="select select-bordered select-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                <option value="">{t("all")}</option>
                <option value="high">{t("50PlusOff")}</option>
                <option value="medium">{t("30To49Off")}</option>
                <option value="low">{t("lessThan30Off")}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <ArrowUpDown className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                {t("sortBy")}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered select-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                <option value="discountPercentage">
                  {t("discountHighToLow")}
                </option>
                <option value="endDate">{t("endingSoon")}</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {t("showing")} {filteredProducts.length} {t("of")}{" "}
              {discountedProducts.length} {t("offers")}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
              >
                <div className="skeleton h-64 w-full rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="skeleton h-6 w-3/4 mb-2"></div>
                  <div className="skeleton h-4 w-1/2 mb-4"></div>
                  <div className="skeleton h-10 w-full rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : discountedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                <Tag className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t("noSpecialOffers")}
              </h3>
              <p className="text-gray-500 mb-6">{t("checkBackLater")}</p>
              <Link
                href="/products"
                className="btn bg-amber-500 hover:bg-amber-600 text-white btn-lg w-full border-none"
              >
                {t("browseAllProducts")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6 ">
            {filteredProducts.map((product) => {
              const discountPercent =
                product.discountPercentage ||
                calculateDiscountPercentage(
                  product.price,
                  product.discountPrice
                );

              const discountIntensity = getDiscountIntensity(discountPercent);

              return (
                <div
                  key={product._id}
                  className={`group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                    discountIntensity === "high"
                      ? "border-amber-200 hover:border-amber-300"
                      : discountIntensity === "medium"
                      ? "border-orange-200 hover:border-orange-300"
                      : "border-yellow-200 hover:border-yellow-300"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <Link href={`/product/${product._id}`}>
                      <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-72 bg-gradient-to-br from-gray-50 to-gray-100">
                        {product.images?.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            quality={90}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              e.target.src = "/images/placeholder.png";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-16 h-16"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}

                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                            discountIntensity === "high"
                              ? "discount-high-animation"
                              : discountIntensity === "medium"
                              ? "discount-medium-animation"
                              : "discount-low-animation"
                          }`}
                        ></div>
                      </div>
                    </Link>

                    {/* Discount Badge */}
                    <div
                      className={`absolute top-3 left-3 sm:top-4 sm:left-4 ${
                        discountIntensity === "high"
                          ? "discount-badge-high"
                          : discountIntensity === "medium"
                          ? "discount-badge-medium"
                          : "discount-badge-low"
                      }`}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-current rounded-full animate-ping opacity-75"></div>
                        <div className="relative flex items-center gap-1 px-3 py-1 sm:py-2 rounded-full text-white font-bold text-xs sm:text-sm z-10">
                          <Zap className="w-4 h-4" fill="currentColor" />
                          {discountPercent}
                          {t("off")}
                        </div>
                      </div>
                    </div>

                    {product.category?.name && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          {product.category.name}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`absolute bottom-14 right-3 sm:bottom-16 sm:right-4 z-10 p-2.5 rounded-full transition-all duration-300 shadow-md ${
                        isInWishlist(product._id)
                          ? "bg-red-500 text-white scale-110"
                          : "bg-white/95 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white hover:scale-105"
                      }`}
                      title={t("wishlist")}
                    >
                      <FiHeart size={14} className={isInWishlist(product._id) ? "fill-current" : ""} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInCompare(product._id)) {
                          removeFromCompare(product._id);
                        } else {
                          addToCompare(product);
                        }
                      }}
                      className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 p-2.5 rounded-full transition-all duration-300 shadow-md ${
                        isInCompare(product._id)
                          ? "bg-emerald-500 text-white scale-110"
                          : "bg-white/95 backdrop-blur-sm text-gray-500 hover:text-emerald-500 hover:bg-white hover:scale-105"
                      }`}
                      title={t("compare")}
                    >
                      <FiGrid size={14} />
                    </button>

                    {discountPercent >= 50 && (
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                        <div className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          {t("hotDeal")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col justify-between flex-grow p-4 sm:p-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        <Link href={`/product/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      {product.brand?.name && (
                        <p className="text-sm text-gray-500 mb-2 sm:mb-3">
                          {t("by")} {product.brand.name}
                        </p>
                      )}

                      {product.description && (
                        <div
                          className="text-sm text-gray-600 mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html:
                              product.description.substring(0, 100) +
                              (product.description.length > 100 ? "..." : ""),
                          }}
                        />
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.averageRating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 ml-2">
                          {product.averageRating?.toFixed(1) || "0.0"} (
                          {product.numReviews || 0} {t("reviews")})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-xl sm:text-2xl font-bold text-amber-600">
                              {formatPrice(product.discountPrice)}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-amber-600">
                            {t("save")}{" "}
                            {formatPrice(product.price - product.discountPrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("youSave")} {discountPercent}%
                          </p>
                        </div>
                      </div>

                      {/* Limited Stock */}
                      {product.countInStock > 0 &&
                        product.countInStock < 10 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{t("limitedStock")}</span>
                              <span>
                                {product.countInStock} {t("left")}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                                style={{
                                  width: `${
                                    (product.countInStock / 10) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className={`w-full btn btn-lg font-semibold transition-all duration-300 border-none ${
                          animatingProductId === product._id
                            ? "bg-green-500 hover:bg-green-600 text-white scale-95"
                            : discountIntensity === "high"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : discountIntensity === "medium"
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                        }`}
                      >
                        {animatingProductId === product._id ? (
                          <>
                            <div className="loading loading-spinner loading-sm"></div>
                            {t("added")}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            {t("addToCart")}
                          </>
                        )}
                      </button>

                      <div className="mt-3 text-center">
                        <Link
                          href={`/product/${product._id}`}
                          className="text-sm text-amber-600 hover:text-amber-700 transition-colors font-medium"
                        >
                          {t("quickView")} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special Offer Banner */}
        {discountedProducts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-2">{t("dontWait")}</h3>
              <p className="text-lg mb-4 opacity-90">
                {t("shopNowBeforeGone")}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <Clock className="w-4 h-4" />
                <span>{t("limitedTimeOffer")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .discount-high-animation {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(245, 158, 11, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountHigh 2s ease-in-out infinite;
        }
        .discount-medium-animation {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(251, 146, 60, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountMedium 3s ease-in-out infinite;
        }
        .discount-low-animation {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(253, 230, 138, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountLow 4s ease-in-out infinite;
        }
        .discount-badge-high {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }
        .discount-badge-medium {
          background: linear-gradient(135deg, #fb923c, #ea580c);
          box-shadow: 0 4px 15px rgba(251, 146, 60, 0.4);
        }
        .discount-badge-low {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
        }
        @keyframes discountHigh {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes discountMedium {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes discountLow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .font-arabic {
          font-family: "Cairo", "Geeza Pro", sans-serif;
        }
      `}</style>
    </section>
  );
}
