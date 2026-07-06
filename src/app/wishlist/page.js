"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useCart } from "../../../components/CartContext";
import { useWishlist } from "../../../components/WishlistContext";
import { useCurrency } from "../../../components/CurrencyContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiTrash2, FiShoppingCart, FiHeart, FiArrowLeft, FiStar } from "react-icons/fi";
import "../../../i18n";

export default function WishlistPage() {
  const { status: sessionStatus } = useSession();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { updateCartCount } = useCart();
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { formatPrice } = useCurrency();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.title = `${t("name") || "Sil3aty"} | ${t("yourWishlist") || "My Wishlist"}`;
  }, [t]);

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

  const handleRemoveFromWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center space-y-3">
          <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          <p className="text-gray-500 text-sm font-semibold">{t("pleaseWait") || "Loading wishlist..."}</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiHeart size={40} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              {t("yourWishlist") || "My Wishlist"}
            </h1>
            <p className="text-gray-500">
              {t("pleaseSignInToAddToWishlist") || "Please sign in to view your wishlist."}
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="btn btn-primary w-full rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            {t("signIn") || "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiHeart size={40} className="text-gray-300" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">
              {t("yourWishlist") || "My Wishlist"}
            </h1>
            <p className="text-gray-500">
              {t("wishlistEmpty") || "Your wishlist is empty."}
            </p>
          </div>
          <button
            onClick={() => router.push("/product")}
            className="btn btn-primary w-full rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            {isRTL ? <FiArrowLeft className="rotate-180" /> : <FiArrowLeft />}
            {t("continueShopping") || "Continue Shopping"}
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
        {/* Title and stats */}
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
                {t("yourWishlist") || "My Wishlist"}
              </h1>
              <p className="text-gray-500 text-sm">
                {(isRTL ? "لديك " : "You have ") + wishlistItems.length + (isRTL ? " منتجات في المفضلة" : " products in your wishlist")}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            if (!product) return null;
            const activePrice = getProductPrice(product, false);
            const activeDiscountPrice = getProductPrice(product, true);
            const hasDiscount = activeDiscountPrice < activePrice;

            return (
              <div 
                key={product._id} 
                className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden flex flex-col h-full"
              >
                {/* Image header container */}
                <div className="relative w-full h-56 bg-white border-b border-gray-50 overflow-hidden flex items-center justify-center p-4">
                  <Link href={`/product/${product._id}`} className="w-full h-full">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} p-2.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-md z-10`}
                    title={t("removeFromWishlist") || "Remove"}
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Discount tag */}
                  {hasDiscount && (
                    <span className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-full shadow-md`}>
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Info and buttons */}
                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <div className="space-y-2 text-start">
                    {/* Brand */}
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide">
                      {product.brand?.name || product.brand || "-"}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-emerald-600 transition-colors">
                      <Link href={`/product/${product._id}`}>{product.name}</Link>
                    </h3>

                    {/* Price and discount */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-extrabold text-gray-900">
                        {formatPrice(hasDiscount ? product.discountPrice : product.price, product, hasDiscount ? "discount" : "price")}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price, product, "price")}
                        </span>
                      )}
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <FiStar className="fill-current" />
                      <span className="font-extrabold text-gray-800">
                        {product.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-gray-400 font-medium">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary w-full rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-emerald-500/10"
                    disabled={product.countInStock === 0}
                  >
                    <FiShoppingCart size={15} />
                    {product.countInStock === 0 ? t("outOfStock") : t("addToCart")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
