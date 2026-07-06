"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  Star,
  Filter,
  X,
  ShoppingCart,
  Heart,
  Zap,
  Truck,
  Shield,
  CheckCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useCurrency } from "../../../components/CurrencyContext";

export default function SearchResultsPage() {
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [activeBrandFilter, setActiveBrandFilter] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/search?query=${encodeURIComponent(query)}`
        );

        if (!data?.results) {
          throw new Error("Invalid response structure");
        }

        // Extract unique brands and categories from results
        const allBrands = data.results
          .map((product) => product.brand)
          .filter(
            (brand, index, self) =>
              brand && self.findIndex((t) => t?._id === brand?._id) === index
          );

        const allCategories = data.results
          .map((product) => product.category)
          .filter(
            (category, index, self) =>
              category &&
              self.findIndex((t) => t?._id === category?._id) === index
          );

        setResults(data.results);
        setBrands(allBrands);
        setCategories(allCategories);
        setError("");
      } catch (error) {
        setError(error.response?.data?.error || error.message);
        setResults([]);
        setBrands([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await fetch("/api/cart/count");
        const data = await res.json();
        setCartItemsCount(data.count || 0);
      } catch (error) {}
    };

    fetchCartCount();
  }, []);

  // Handle Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      const countResponse = await fetch("/api/cart/count");
      const countData = await countResponse.json();
      setCartItemsCount(countData.count || 0);

      toast.success("Product added to cart!");
    } catch (error) {
      toast.error(error.message || "Failed to add product to cart");
    }
  };

  // Handle Wishlist
  const handleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        // Remove from wishlist
        await axios.delete(`/api/wishlist/${productId}`);
        setWishlist(wishlist.filter((id) => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await axios.post("/api/wishlist", { productId });
        setWishlist([...wishlist, productId]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Please sign in to manage wishlist");
    }
  };

  // Filter and sort results
  const filteredResults = results
    .filter((product) => {
      const brandMatch =
        !activeBrandFilter || product.brand?._id === activeBrandFilter;
      const categoryMatch =
        !activeCategoryFilter || product.category?._id === activeCategoryFilter;
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return brandMatch && categoryMatch && priceMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Calculate discount percentage
  const calculateDiscount = (product) => {
    if (
      product.discountPrice &&
      product.price &&
      product.price > product.discountPrice
    ) {
      return Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      );
    }
    return 0;
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "text-amber-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  // Get max price for range slider
  const maxPrice = Math.max(...results.map((p) => p.price || 0), 1000);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Searching for "{query}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Search Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Search Results for "<span className="text-green-600">{query}</span>"
          </h1>
          <p className="text-gray-600 text-lg">
            Found {filteredResults.length} product
            {filteredResults.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <SlidersHorizontal size={20} />
            <span className="font-semibold">Filters</span>
          </button>

          {/* Sort Options */}
          <div className="flex-1 flex flex-wrap gap-4 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>

            {/* Active Filters */}
            {(activeBrandFilter ||
              activeCategoryFilter ||
              priceRange[1] < maxPrice) && (
              <div className="flex flex-wrap gap-2">
                {activeBrandFilter && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    Brand:{" "}
                    {brands.find((b) => b._id === activeBrandFilter)?.name}
                    <button
                      onClick={() => setActiveBrandFilter("")}
                      className="ml-1 hover:text-green-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {activeCategoryFilter && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    Category:{" "}
                    {
                      categories.find((c) => c._id === activeCategoryFilter)
                        ?.name
                    }
                    <button
                      onClick={() => setActiveCategoryFilter("")}
                      className="ml-1 hover:text-emerald-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {priceRange[1] < maxPrice && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <button
                      onClick={() => setPriceRange([0, maxPrice])}
                      className="ml-1 hover:text-green-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Price Range
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Brands</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label
                        key={brand._id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="brand"
                          checked={activeBrandFilter === brand._id}
                          onChange={() =>
                            setActiveBrandFilter(
                              activeBrandFilter === brand._id ? "" : brand._id
                            )
                          }
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700 group-hover:text-green-600 transition-colors">
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={activeCategoryFilter === category._id}
                          onChange={() =>
                            setActiveCategoryFilter(
                              activeCategoryFilter === category._id
                                ? ""
                                : category._id
                            )
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700 group-hover:text-emerald-600 transition-colors">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setActiveBrandFilter("");
                  setActiveCategoryFilter("");
                  setPriceRange([0, maxPrice]);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResults.map((product) => {
                  const discount = calculateDiscount(product);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <Link href={`/product/${product._id}`}>
                          <Image
                            src={
                              product.images?.[0] || "/images/placeholder.png"
                            }
                            alt={product.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </Link>

                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                            <Zap size={14} fill="white" />
                            {discount}% OFF
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={() => handleWishlist(product._id)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                            wishlist.includes(product._id)
                              ? "bg-red-500 text-white"
                              : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={
                              wishlist.includes(product._id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        {/* Stock Status */}
                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              product.countInStock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.countInStock > 0
                              ? `${product.countInStock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Brand and Category */}
                        <div className="flex items-center justify-between mb-2">
                          {product.brand?.name && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              {product.brand.name}
                            </span>
                          )}
                          {product.category?.name && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                              {product.category.name}
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <Link href={`/product/${product._id}`}>
                          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors h-12">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {renderStars(product.averageRating || 0)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({product.numReviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          {discount > 0 ? (
                            <>
                              <span className="text-xl font-bold text-green-600">
                                {formatPrice(product.discountPrice, product, "discount")}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                {formatPrice(product.price, product, "price")}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-800">
                              {formatPrice(product.price || 0, product, "price")}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={product.countInStock <= 0}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={18} />
                          {product.countInStock > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
