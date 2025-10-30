"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ShoppingCart, Star, Zap, Clock, Tag } from "lucide-react";
import { useCart } from "../../../components/CartContext";

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/featured`,
      {
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default function FeaturedProductsPage() {
  const { updateCartCount } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatingProductId, setAnimatingProductId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getFeaturedProducts();
      const categories = await getCategories();
      setFeaturedProducts(products);
      setCategories(categories);
      setLoading(false);
    };
    fetchData();
  }, []);

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

      toast.success("Product added to cart!");
      await updateCartCount();
      setAnimatingProductId(productId);
      setTimeout(() => setAnimatingProductId(null), 500);
    } catch (error) {
      toast.error("Failed to add product to cart");
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

  const renderStars = (rating, numReviews) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-500 ml-1">({numReviews || 0})</span>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Featured Collection
            </h1>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Star
              className="w-8 h-8 text-emerald-500 animate-pulse"
              fill="currentColor"
            />
            <p className="text-xl text-gray-700 font-semibold">
              Premium Selection
            </p>
            <Zap
              className="w-8 h-8 text-green-500 animate-bounce"
              fill="currentColor"
            />
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products with exclusive
            features and special offers
          </p>
        </div>

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
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                <Tag className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Featured Products Available
              </h3>
              <p className="text-gray-500 mb-6">
                Check back later for our premium selections!
              </p>
              <Link
                href="/products"
                className="btn bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white btn-lg w-full border-none"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => {
              const hasDiscount =
                product.isOnSale &&
                product.discountPrice &&
                product.discountPrice < product.price;

              const discountPercent = hasDiscount
                ? calculateDiscountPercentage(
                    product.price,
                    product.discountPrice
                  )
                : 0;

              const discountIntensity = getDiscountIntensity(discountPercent);

              return (
                <div
                  key={product._id}
                  className={`group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                    hasDiscount
                      ? discountIntensity === "high"
                        ? "border-red-200 hover:border-red-300"
                        : discountIntensity === "medium"
                        ? "border-orange-200 hover:border-orange-300"
                        : "border-amber-200 hover:border-amber-300"
                      : "border-emerald-200 hover:border-emerald-300"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-2xl h-72 w-full bg-white">
                    <Link href={`/product/${product._id}`}>
                      {product.images?.length > 0 ? (
                        <Image
                          src={`${product.images[0]}?q=90`}
                          alt={product.name}
                          fill
                          quality={90}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
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

                      {hasDiscount && (
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                            discountIntensity === "high"
                              ? "discount-high-animation"
                              : discountIntensity === "medium"
                              ? "discount-medium-animation"
                              : "discount-low-animation"
                          }`}
                        ></div>
                      )}
                    </Link>

                    {hasDiscount && (
                      <div
                        className={`absolute top-4 left-4 ${
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
                            {discountPercent}% OFF
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        FEATURED
                      </div>
                    </div>

                    {product.category?.name && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          {product.category.name}
                        </span>
                      </div>
                    )}

                    {/* Hot Deal Badge */}
                    {hasDiscount && discountPercent >= 50 && (
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          🔥 HOT DEAL
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      <Link href={`/product/${product._id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    {product.brand?.name && (
                      <p className="text-sm text-gray-500 mb-3">
                        by {product.brand.name}
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

                    <div className="mb-3">
                      {renderStars(
                        product.averageRating || 0,
                        product.numReviews || 0
                      )}
                    </div>

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
                            Save $
                            {(product.price - product.discountPrice).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            You save {discountPercent}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Limited Stock */}
                    {product.countInStock > 0 && product.countInStock < 10 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Limited Stock</span>
                          <span>{product.countInStock} left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
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
                            : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                        }`}
                      >
                        {animatingProductId === product._id ? (
                          <>
                            <div className="loading loading-spinner loading-sm"></div>
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </>
                        )}
                      </button>

                      <div className="mt-3 text-center">
                        <Link
                          href={`/product/${product._id}`}
                          className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                        >
                          Quick View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special Banner for Featured Collection */}
        {featuredProducts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-2">⭐ Premium Quality</h3>
              <p className="text-lg mb-4 opacity-90">
                Handpicked products with exceptional quality and exclusive
                features
              </p>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <Star className="w-4 h-4" fill="currentColor" />
                <span>Curated Selection</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for Discount Animations */}
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
          border-radius: 9999px;
        }

        .discount-badge-medium {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
          border-radius: 9999px;
        }

        .discount-badge-low {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
          border-radius: 9999px;
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
      `}</style>
    </section>
  );
}
