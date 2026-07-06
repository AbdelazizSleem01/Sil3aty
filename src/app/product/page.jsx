"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "../../../i18n";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  BadgeCheck,
  TriangleAlert,
  Star,
  Zap,
  ShoppingCart,
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "../../../components/CartContext";
import { useCompare } from "../../../components/CompareContext";
import { useWishlist } from "../../../components/WishlistContext";
import { useCurrency } from "../../../components/CurrencyContext";
import { FiGrid, FiHeart } from "react-icons/fi";
import { useSession } from "next-auth/react";
import axios from "axios";

function AllProductsPageContent() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { formatPrice } = useCurrency();
  const { data: session } = useSession();
  const { updateCartCount } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatingProductId, setAnimatingProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const productsPerPage = 16;
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search: "",
    brand: null,
    category: null,
    priceRange: [0, 1000],
    inStock: false,
    onSale: false,
    featured: false,
    minRating: 0,
    sortBy: "name",
    sortOrder: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, brandsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/brands"),
          fetch("/api/category"),
        ]);

        if (!productsRes.ok || !brandsRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [productsData, brandsData, categoriesData] = await Promise.all([
          productsRes.json(),
          brandsRes.json(),
          categoriesRes.json(),
        ]);

        setProducts(productsData);
        setBrands(brandsData);
        setCategories(categoriesData);

        const brandParam = searchParams.get("brand");
        const categoryParam = searchParams.get("category");
        const searchParam = searchParams.get("search");

        if (brandParam || categoryParam || searchParam) {
          setFilters((prev) => ({
            ...prev,
            brand: brandParam,
            category: categoryParam,
            search: searchParam || "",
          }));
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      brand: null,
      category: null,
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      featured: false,
      minRating: 0,
      sortBy: "name",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

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
      setAnimatingProductId(productId);
      setTimeout(() => setAnimatingProductId(null), 500);

      await updateCartCount();
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

  const renderStars = (rating, numReviews) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} size={14} className="text-yellow-500 fill-current" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} size={14} className="text-yellow-500 fill-current" />
        );
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-xs text-gray-500 ml-1">({numReviews || 0})</span>
      </div>
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const searchMatch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        product.brand?.name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const brandMatch = !filters.brand || product.brand?._id === filters.brand;
      const categoryMatch =
        !filters.category || product.category?.slug === filters.category;
      const priceMatch =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];
      const stockMatch = !filters.inStock || product.countInStock > 0;
      const saleMatch =
        !filters.onSale || (product.isOnSale && product.discountPrice);
      const featuredMatch = !filters.featured || product.isFeatured;
      const ratingMatch = (product.averageRating || 0) >= filters.minRating;

      return (
        searchMatch &&
        brandMatch &&
        categoryMatch &&
        priceMatch &&
        stockMatch &&
        saleMatch &&
        featuredMatch &&
        ratingMatch
      );
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "price":
          aValue = a.discountPrice || a.price;
          bValue = b.discountPrice || b.price;
          break;
        case "rating":
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case "name":
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [products, filters]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const activeFiltersCount = [
    filters.search,
    filters.brand,
    filters.category,
    filters.inStock,
    filters.onSale,
    filters.featured,
    filters.minRating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen backdrop-blur-sm" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center space-y-4">
          <span className="loading loading-infinity loading-lg text-primary"></span>
          <p className="text-lg font-medium text-gray-800" suppressHydrationWarning>
            {t("loadingProducts")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-emerald-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-primary ">
          {t("allProducts")}
        </h1>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t("searchProductsByNameBrandDescription")}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className={`w-full ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white shadow-sm`}
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary btn-lg flex items-center gap-2"
              >
                <SlidersHorizontal size={20} />
                {t("filters")}
                {activeFiltersCount > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn btn-warning btn-sm text-white hover:text-gray-700"
                >
                  {t("clearAll")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="name">{t("sortByName")}</option>
                <option value="price">{t("sortByPrice")}</option>
                <option value="rating">{t("sortByRating")}</option>
              </select>

              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
                className="select select-bordered select-sm"
              >
                <option value="asc">{t("ascending")}</option>
                <option value="desc">{t("descending")}</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="font-semibold text-gray-700">
                    {t("priceRange")}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        handleFilterChange("priceRange", [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="range range-primary range-sm"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-semibold text-gray-700">
                    {t("minimumRating")}
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) =>
                      handleFilterChange("minRating", parseInt(e.target.value))
                    }
                    className="select select-bordered select-sm w-full"
                  >
                    <option value={0}>{t("anyRating")}</option>
                    <option value={4}>{t("stars4Plus")}</option>
                    <option value={3}>{t("stars3Plus")}</option>
                    <option value={2}>{t("stars2Plus")}</option>
                    <option value={1}>{t("stars1Plus")}</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="font-semibold text-gray-700">
                    {t("quickFilters")}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) =>
                          handleFilterChange("inStock", e.target.checked)
                        }
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="text-sm">{t("inStockOnly")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) =>
                          handleFilterChange("onSale", e.target.checked)
                        }
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="text-sm">{t("onSale")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) =>
                          handleFilterChange("featured", e.target.checked)
                        }
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="text-sm">{t("featured")}</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-semibold text-gray-700">{t("brand")}</label>
                  <select
                    value={filters.brand || ""}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value || null)
                    }
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="">{t("allBrands")}</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="font-semibold text-gray-700">
                    {t("category")}
                  </label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value || null)
                    }
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="">{t("allCategories")}</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="badge badge-primary badge-lg gap-2">
                  Search: "{filters.search}"
                  <button onClick={() => handleFilterChange("search", "")}>
                    ×
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="badge badge-secondary badge-lg gap-2">
                  Brand: {brands.find((b) => b._id === filters.brand)?.name}
                  <button onClick={() => handleFilterChange("brand", null)}>
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="badge badge-accent badge-lg gap-2">
                  Category:{" "}
                  {categories.find((c) => c.slug === filters.category)?.name}
                  <button onClick={() => handleFilterChange("category", null)}>
                    ×
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="badge badge-success badge-lg gap-2">
                  {t("inStock")}
                  <button onClick={() => handleFilterChange("inStock", false)}>
                    ×
                  </button>
                </span>
              )}
              {filters.onSale && (
                <span className="badge badge-warning badge-lg gap-2">
                  {t("onSale")}
                  <button onClick={() => handleFilterChange("onSale", false)}>
                    ×
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="badge badge-info badge-lg gap-2">
                  {t("featured")}
                  <button onClick={() => handleFilterChange("featured", false)}>
                    ×
                  </button>
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="badge badge-warning badge-lg gap-2">
                  {filters.minRating}+ Stars
                  <button onClick={() => handleFilterChange("minRating", 0)}>
                    ×
                  </button>
                </span>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <span className="badge badge-neutral badge-lg gap-2">
                  Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <button
                    onClick={() => handleFilterChange("priceRange", [0, 1000])}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {t("showing")} <span className="font-bold">{filteredProducts.length}</span>{" "}
            {t("products")}
            {filters.search && ` ${t("for")} "${filters.search}"`}
          </p>
          <p className="text-sm text-gray-500">
            {t("page")} {currentPage} {t("of")}{" "}
            {Math.ceil(filteredProducts.length / productsPerPage)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => {
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
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <Link href={`/product/${product._id}`}>
                    <div className="relative h-56 w-full bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          onError={() => {
                            e.target.src = "/images/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-2xl">📷</span>
                            </div>
                            <p className="text-sm text-gray-500">{t("noImage")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {hasDiscount && (
                    <div
                      className={`absolute top-3 left-3 ${
                        discountIntensity === "high"
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : discountIntensity === "medium"
                          ? "bg-gradient-to-r from-orange-500 to-amber-500"
                          : "bg-gradient-to-r from-amber-500 to-yellow-500"
                      } text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg`}
                    >
                      <div className="flex items-center gap-1">
                        <Zap size={12} fill="white" />
                        {discountPercent}% OFF
                      </div>
                    </div>
                  )}

                  {product.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        <div className="flex items-center gap-1">
                          <BadgeCheck size={12} />
                          {t("featured").toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}

                  {product.category?.name && (
                    <div className="absolute bottom-3 left-3">
                      <Link
                        href={`?category=${product.category?.slug}`}
                        className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm hover:bg-black/80 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className={`absolute bottom-14 right-3 z-10 p-2 rounded-full transition-all duration-300 shadow-md ${
                      isInWishlist(product._id)
                        ? "bg-red-500 text-white scale-110"
                        : "bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white hover:scale-105"
                    }`}
                    title={t("wishlist")}
                  >
                    <FiHeart size={16} className={isInWishlist(product._id) ? "fill-current" : ""} />
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
                    className={`absolute bottom-3 right-3 z-10 p-2 rounded-full transition-all duration-300 shadow-md ${
                      isInCompare(product._id)
                        ? "bg-emerald-500 text-white scale-110"
                        : "bg-white/80 backdrop-blur-sm text-gray-500 hover:text-emerald-500 hover:bg-white hover:scale-105"
                    }`}
                    title={t("compare")}
                  >
                    <FiGrid size={16} />
                  </button>
                </div>

                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    <Link href={`/product/${product._id}`}>{product.name}</Link>
                  </h2>

                  {product.brand?.name && (
                    <p className="text-xs text-gray-500 mb-2">
                      by {product.brand.name}
                    </p>
                  )}

                  <div className="mb-3">
                    {renderStars(
                      product.averageRating || 0,
                      product.numReviews || 0
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <p className="text-xl font-bold text-green-600">
                            {formatPrice(product.discountPrice)}
                          </p>
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-gray-800">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>

                    {hasDiscount && (
                      <div className="text-right">
                        <p className="text-xs font-semibold text-red-600">
                          {t("save") || "Save"}{" "}
                          {formatPrice(product.price - product.discountPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/product/${product._id}`}
                      className="btn btn-outline btn-sm flex-1 hover:btn-primary transition-colors"
                    >
                      {t("details")}
                      <ArrowRightIcon size={16} className="ml-1" />
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className={`btn btn-sm ${
                        animatingProductId === product._id
                          ? "btn-success scale-95"
                          : "btn-primary"
                      } transition-all duration-300`}
                    >
                      {animatingProductId === product._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                    </button>
                  </div>

                  {product.countInStock > 0 && product.countInStock < 10 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t("onlyLeft", { count: product.countInStock })}</span>
                        <span>{t("limitedStock")}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(product.countInStock / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {filteredProducts.length > productsPerPage && (
          <div className="flex items-center justify-between mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-sm text-gray-600">
              {t("showing")}{" "}
              <span className="font-bold">
                {(currentPage - 1) * productsPerPage + 1}
              </span>{" "}
              {t("to")}{" "}
              <span className="font-bold">
                {Math.min(
                  currentPage * productsPerPage,
                  filteredProducts.length
                )}
              </span>{" "}
              {t("of")} <span className="font-bold">{filteredProducts.length}</span>{" "}
              {t("products")}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-sm btn-ghost disabled:opacity-50"
                title={t("firstPage")}
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-ghost disabled:opacity-50"
              >
                ‹
              </button>
              {Array.from(
                {
                  length: Math.ceil(filteredProducts.length / productsPerPage),
                },
                (_, i) => i + 1
              )
                .filter((page) => {
                  const totalPages = Math.ceil(
                    filteredProducts.length / productsPerPage
                  );
                  const startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, currentPage + 2);
                  return page >= startPage && page <= endPage;
                })
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${
                      page === currentPage ? "btn-primary" : "btn-ghost"
                    } ${page === currentPage ? "pointer-events-none" : ""}`}
                  >
                    {page}
                  </button>
                ))}
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      p + 1,
                      Math.ceil(filteredProducts.length / productsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredProducts.length / productsPerPage)
                }
                className="btn btn-sm btn-ghost disabled:opacity-50"
              >
                ›
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.ceil(filteredProducts.length / productsPerPage)
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredProducts.length / productsPerPage)
                }
                className="btn btn-sm btn-ghost disabled:opacity-50"
                title={t("lastPage")}
              >
                »
              </button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <TriangleAlert className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t("noProductsFound")}
              </h3>
              <p className="text-gray-500 mb-6">
                {t("tryAdjustingSearch")}
              </p>
              <button
                onClick={clearAllFilters}
                className="btn btn-primary btn-lg w-full"
              >
                {t("clearAllFilters")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen backdrop-blur-sm">
        <div className="text-center space-y-4">
          <span className="loading loading-infinity loading-lg text-primary"></span>
          <p className="text-lg font-medium text-gray-800">
            Loading Products...
          </p>
        </div>
      </div>
    }>
      <AllProductsPageContent />
    </Suspense>
  );
}
