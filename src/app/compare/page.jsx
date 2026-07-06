"use client";

import { useCompare } from "../../../components/CompareContext";
import { useCart } from "../../../components/CartContext";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../components/CurrencyContext";
import { useRouter } from "next/navigation";
import { FiTrash2, FiShoppingCart, FiArrowLeft, FiStar, FiGrid } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import "../../../i18n";

import { useState } from "react";

function ProductImageCarousel({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-60 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        📷
      </div>
    );
  }

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-60 bg-white border border-gray-100 rounded-2xl overflow-hidden group shadow-xs">
      <div className="relative w-full h-full">
        {images.map((imgUrl, idx) => (
          <img
            key={imgUrl}
            src={imgUrl}
            alt={name}
            className={`absolute inset-0 rounded-2xl w-full h-full object-contain p-4 transition-all duration-500 ease-in-out transform ${
              idx === currentIndex 
                ? "opacity-100 scale-100 z-10" 
                : "opacity-0 scale-95 z-0 pointer-events-none"
            }`}
          />
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-20 border border-gray-100"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-20 border border-gray-100"
          >
            ›
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/10 px-2 py-1 rounded-full backdrop-blur-xs">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { updateCartCount } = useCart();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const handleAddToCart = async (product) => {
    try {
      const response = await axios.post("/api/cart", {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || "",
        color: product.colors?.[0] || "",
      });

      if (response.status === 200) {
        toast.success(t("productAddedToCart") || "Product added to cart!");
        await updateCartCount();
      } else {
        toast.error(t("failedToAddToCart") || "Failed to add to cart");
      }
    } catch (error) {
      toast.error(t("failedToAddToCart") || "Failed to add to cart");
    }
  };

  if (compareItems.length === 0) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiGrid size={40} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              {t("compare") || "Compare Products"}
            </h1>
            <p className="text-gray-500">
              {t("noProductsToCompare") || "No products added to compare list yet."}
            </p>
          </div>
          <button
            onClick={() => router.push("/product")}
            className="btn btn-primary w-full rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            {isRTL ? <FiArrowLeft className="rotate-180" /> : <FiArrowLeft />}
            {t("startShopping") || "Start Shopping"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/50 to-green-50 p-6 md:p-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back and title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-2xl text-gray-600 transition-colors shadow-sm"
              title={t("back") || "Back"}
            >
              {isRTL ? <FiArrowLeft className="rotate-180" size={18} /> : <FiArrowLeft size={18} />}
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="h-6 w-2 rounded-full bg-emerald-500"></span>
                {t("comparisonTable") || "Products Comparison"}
              </h1>
              <p className="text-gray-500 text-sm">
                {t("compareLimitReached") || "Compare products specs side-by-side"}
              </p>
            </div>
          </div>
          <button
            onClick={clearCompare}
            className="btn btn-outline btn-error rounded-2xl hover:scale-105 transition-transform"
          >
            <FiTrash2 />
            {t("clearAll") || "Clear All"}
          </button>
        </div>

        {/* Desktop grid */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-6 text-start text-sm font-bold text-gray-400 w-48 bg-gray-50/30">
                  {t("product") || "Product"}
                </th>
                {compareItems.map((product) => (
                  <th key={product._id} className="p-6 min-w-[220px] text-start relative group">
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                      title={t("removeFromCompare") || "Remove"}
                    >
                      <FiTrash2 size={14} />
                    </button>
                    <div className="space-y-4">
                      <ProductImageCarousel images={product.images} name={product.name} />
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-2 min-h-[48px]">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn btn-primary btn-sm w-full rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                          disabled={product.countInStock === 0}
                        >
                          <FiShoppingCart size={14} />
                          {product.countInStock === 0 ? t("outOfStock") : t("addToCart")}
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Price row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("price") || "Price"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-gray-900">
                        {formatPrice(product.discountPrice || product.price, product, product.discountPrice ? "discount" : "price")}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price, product, "price")}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Brand row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("brand") || "Brand"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6 font-semibold text-gray-800">
                    {product.brand?.name || product.brand || "-"}
                  </td>
                ))}
              </tr>

              {/* Category row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("category") || "Category"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-lg tracking-wide uppercase">
                      {product.category?.name || product.category || "-"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Rating row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("rating") || "Rating"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-400">
                        <FiStar className="fill-current" size={16} />
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm">
                        {product.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({product.numReviews || 0} {t("reviews") || "reviews"})
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Colors row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("colors") || "Colors"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6">
                    {product.colors && product.colors.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.colors.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Sizes row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("sizes") || "Sizes"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6">
                    {product.sizes && product.sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Details description row */}
              <tr>
                <td className="p-6 font-bold text-gray-500 bg-gray-50/30">{t("details") || "Details"}</td>
                {compareItems.map((product) => (
                  <td key={product._id} className="p-6 text-sm text-gray-600 leading-relaxed max-w-sm">
                    <div 
                      dangerouslySetInnerHTML={{ __html: product.description || "-" }} 
                      className="prose prose-sm max-w-none text-gray-600 text-start"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
