"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  TrendingUp,
  Star,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import { useCart } from "../../../components/CartContext";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function TopSellingProductsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { updateCartCount } = useCart();
  const [animatingProductId, setAnimatingProductId] = useState(null);

  const { data: topSellingProductsData, error: productsError } = useSWR("/api/products/top-selling");

  const topSellingProducts = topSellingProductsData || [];
  const loading = !topSellingProductsData && !productsError;

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
      setTimeout(() => setAnimatingProductId(null), 600);
    } catch (error) {
      toast.error(t("failedToAddToCart"));
    }
  };

  const calculateDiscountPercentage = (price, discountPrice) => {
    if (!price || !discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const getDiscountIntensity = (percentage) => {
    if (percentage >= 50) return "high";
    if (percentage >= 30) return "medium";
    return "low";
  };

  const renderStars = (rating, numReviews) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} size={16} className="text-yellow-500 fill-current" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} size={16} className="text-yellow-500 fill-current" />
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1 mb-2">
        {stars}
        <span className="text-sm text-gray-500 ml-1">
          ({numReviews || 0} {t("reviews")})
        </span>
      </div>
    );
  };

  return (
    <section
      className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 md:py-12 lg:py-16 ${
        isRTL ? "font-arabic" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto ">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <h1 className="relative text-5xl pb-2 md:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t("topSellers")}
            </h1>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <TrendingUp className="w-8 h-8 text-green-500 animate-pulse" />
            <p className="text-xl text-gray-700 font-semibold">
              {t("customerFavorites")}
            </p>
            <Award
              className="w-8 h-8 text-emerald-500 animate-bounce"
              fill="currentColor"
            />
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("discoverTopSelling")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
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
        ) : topSellingProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t("noTopSellingProducts")}
              </h3>
              <p className="text-gray-500 mb-6">{t("checkBackLater")}</p>
              <Link
                href="/products"
                className="btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white btn-lg w-full border-none"
              >
                {t("browseAllProducts")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {topSellingProducts.map((product, index) => {
              const hasDiscount =
                product.isOnSale &&
                product.discountPrice &&
                product.price &&
                product.discountPrice < product.price;

              const discountPercent = hasDiscount
                ? calculateDiscountPercentage(
                    product.price,
                    product.discountPrice
                  )
                : 0;

              const discountIntensity = getDiscountIntensity(discountPercent);
              const isLowStock =
                product.countInStock > 0 && product.countInStock < 10;

              return (
                <div
                  key={product._id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 flex flex-col ${
                    hasDiscount
                      ? discountIntensity === "high"
                        ? "border-red-200 hover:border-red-300"
                        : discountIntensity === "medium"
                        ? "border-orange-200 hover:border-orange-300"
                        : "border-amber-200 hover:border-amber-300"
                      : "border-green-200 hover:border-green-300"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${
                      index * 100
                    }ms forwards`,
                  }}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <Link href={`/product/${product._id}`}>
                      <div className="relative h-64 sm:h-72 md:h-80 w-full bg-white flex items-center justify-center">
                        {product.images?.length > 0 ? (
                          <Image
                            src={`${product.images[0]}?q=90`}
                            alt={product.name}
                            fill
                            quality={90}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
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
                      </div>
                    </Link>

                    {/* Rank Badge */}
                    {index < 3 && (
                      <div
                        className={`absolute top-4 ${
                          isRTL ? "right-4" : "left-4"
                        } z-10 px-4 py-2 text-white font-bold text-sm shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-500 to-gray-600"
                            : "bg-gradient-to-r from-amber-700 to-amber-800"
                        }`}
                        style={{
                          clipPath: isRTL
                            ? "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
                            : "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
                        }}
                      >
                        {index === 0
                          ? isRTL
                            ? "الأول"
                            : "1st"
                          : index === 1
                          ? isRTL
                            ? "الثاني"
                            : "2nd"
                          : isRTL
                          ? "الثالث"
                          : "3rd"}
                      </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div
                        className={`absolute top-4 ${
                          isRTL ? "left-4" : "right-4"
                        } ${
                          discountIntensity === "high"
                            ? "discount-badge-high"
                            : discountIntensity === "medium"
                            ? "discount-badge-medium"
                            : "discount-badge-low"
                        }`}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-current rounded-full animate-ping opacity-75"></div>
                          <div className="relative flex items-center gap-1 px-3 py-2 rounded-full text-white font-bold text-sm z-10">
                            <Zap className="w-4 h-4" fill="currentColor" />
                            {discountPercent}
                            {t("off")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Low Stock */}
                    {isLowStock && (
                      <div
                        className={`absolute bottom-4 ${
                          isRTL ? "right-4" : "left-4"
                        }`}
                      >
                        <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          <Clock className="w-3 h-3" />
                          {t("onlyLeft", { count: product.countInStock })}
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {product.category?.name && (
                      <div
                        className={`absolute bottom-4 ${
                          isRTL ? "left-4" : "right-4"
                        }`}
                      >
                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      <Link href={`/product/${product._id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    {product.brand?.name && (
                      <p className="text-sm text-gray-500 mb-3">
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

                    {renderStars(
                      product.averageRating || 0,
                      product.numReviews || 0
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          {hasDiscount ? (
                            <>
                              <p className="text-2xl font-bold text-green-600">
                                ${product.discountPrice.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <p className="text-2xl font-bold text-gray-800">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {hasDiscount && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {t("save")} $
                            {(product.price - product.discountPrice).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("youSave")} {discountPercent}%
                          </p>
                        </div>
                      )}
                    </div>

                    {isLowStock && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t("limitedStock")}</span>
                          <span>
                            {product.countInStock} {t("left")}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${(product.countInStock / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className={`w-full btn btn-lg font-semibold transition-all duration-300 border-none ${
                          animatingProductId === product._id
                            ? "bg-green-500 hover:bg-green-600 text-white scale-95"
                            : hasDiscount
                            ? discountIntensity === "high"
                              ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                              : discountIntensity === "medium"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                              : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
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
                          className="text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
                        >
                          {t("quickView")} {isRTL ? "←" : "→"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special Banner */}
        {topSellingProducts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-2">
                {t("customerFavorites")}
              </h3>
              <p className="text-lg mb-4 opacity-90">{t("joinThousands")}</p>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>{t("bestSellersCollection")}</span>
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
            rgba(239, 68, 68, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountHigh 2s ease-in-out infinite;
        }
        .discount-medium-animation {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(249, 115, 22, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountMedium 3s ease-in-out infinite;
        }
        .discount-low-animation {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(245, 158, 11, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: discountLow 4s ease-in-out infinite;
        }
        .discount-badge-high {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }
        .discount-badge-medium {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
        }
        .discount-badge-low {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
