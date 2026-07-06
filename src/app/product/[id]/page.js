"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "../../../../i18n";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useSession } from "next-auth/react";
import {
  Star,
  User,
  Zap,
  ShoppingCart,
  ArrowRight,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  CheckCircle,
  Clock,
  Trash,
  Trash2,
} from "lucide-react";
import { useCart } from "../../../../components/CartContext";
import { useCompare } from "../../../../components/CompareContext";
import { useWishlist } from "../../../../components/WishlistContext";
import { useCurrency } from "../../../../components/CurrencyContext";
import { FiGrid } from "react-icons/fi";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Swal from "sweetalert2";

export default function ProductPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const { data: session } = useSession();
  const { updateCartCount } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        if (data) {
          fetchRelatedProducts(data.category?._id, data.brand?._id, data._id);
          fetchRecommendations();
        }
      } catch (error) {
        toast.error(t("failedToLoadProduct"));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}/reviews`);
        setReviews(data);
      } catch (error) {
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const fetchRelatedProducts = async (
    categoryId,
    brandId,
    currentProductId
  ) => {
    setRelatedLoading(true);
    try {
      const { data } = await axios.get(`/api/products/related`, {
        params: {
          category: categoryId,
          brand: brandId,
          exclude: currentProductId,
        },
      });
      setRelatedProducts(data);
    } catch (error) {
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const { data } = await axios.get(
        `/api/recommendations?productId=${id}&limit=6`
      );
      setRecommendations(data.recommendations || []);
    } catch (error) {
      try {
        const { data } = await axios.get(`/api/recommendations?limit=6`);
        setRecommendations(data.recommendations || []);
      } catch (fallbackError) {
        setRecommendations([]);
      }
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error(t("selectSizeAndColor"));
      return;
    }

    try {
      const response = await axios.post("/api/cart", {
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      if (response.status === 200) {
        toast.success(t("productAddedToCart"));
        await updateCartCount();
      } else {
        toast.error(t("failedToAddToCart"));
      }
    } catch (error) {
      toast.error(t("failedToAddToCart"));
    }
  };

  const handleAddReview = async () => {
    if (!session) {
      await Swal.fire({
        icon: "warning",
        title: t("signInRequired"),
        text: t("signInToAddReview"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: t("common.ok")
      });
      return;
    }

    if (rating === 0 || !comment.trim()) {
      await Swal.fire({
        icon: "info",
        title: t("incompleteReview"),
        text: t("provideRatingAndComment"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: t("common.ok")
      });
      return;
    }

    setSubmittingReview(true);

    try {
      Swal.fire({
        title: t("submittingReview"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(`/api/products/${id}/reviews`, {
        rating,
        comment,
      });

      Swal.close();

      if (response.status === 201) {
        await Swal.fire({
          icon: "success",
          title: t("thankYou"),
          text: t("reviewAddedSuccessfully"),
          timer: 2000,
          showConfirmButton: false,
        });

        setRating(0);
        setComment("");

        const { data } = await axios.get(`/api/products/${id}/reviews`);
        setReviews(data);

        const productRes = await axios.get(`/api/products/${id}`);
        setProduct(productRes.data);
      } else {
        await Swal.fire({
          icon: "error",
          title: t("error"),
          text: t("failedToAddReview"),
        });
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("error"),
        text: error.response?.data?.message || t("failedToAddReview"),
      });
    } finally {
      setSubmittingReview(false);
    }
  };


  const renderUserAvatar = (review) => {
    const userImage = review.user?.profilePicture;

    if (userImage) {
      return (
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-white shadow-sm">
          <Image
            src={userImage}
            alt={review.name || "User"}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
        <User className="w-6 h-6 text-gray-500" />
      </div>
    );
  };

  const renderStars = (rating, size = "sm") => {
    const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating ? "text-amber-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleDeleteReview = async (reviewId) => {
    if (!session) {
      toast.error(t("signInToDeleteReviews"));
      return;
    }

    const confirmResult = await Swal.fire({
      title: t("areYouSure"),
      text: t("reviewWillBeDeleted"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("yesDeleteIt"),
      cancelButtonText: t("cancel"),
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `/api/products/reviews/delete/${reviewId}`
      );

      if (response.status === 200) {
        toast.success(t("reviewDeletedSuccessfully"));

        const reviewsRes = await axios.get(`/api/products/${id}/reviews`);
        setReviews(reviewsRes.data);

        const productRes = await axios.get(`/api/products/${id}`);
        setProduct(productRes.data);
      } else {
        toast.error(t("failedToDeleteReview"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("failedToDeleteReview"));
    }
  };

  const calculateDiscountPercentage = () => {
    if (!product) return 0;
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

  const discountPercentage = calculateDiscountPercentage();
  const hasDiscount = discountPercentage > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50" dir={isRTL ? "rtl" : "ltr"}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 text-lg">{t("loadingProductDetails")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("productNotFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("productDoesNotExist")}
          </p>
          <Link
            href="/"
            className="btn bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative group bg-white rounded-3xl shadow-xl overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                className="h-96"
              >
                {product.images?.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        width={600}
                        height={600}
                        className="object-cover w-full h-full rounded-4xl transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {hasDiscount && (
                <div className={`absolute top-6 ${isRTL ? "right-6" : "left-6"} z-10`}>
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-2xl transform -rotate-6">
                    <div className="flex items-center gap-2">
                      <Zap size={16} fill="white" />
                      {discountPercentage}% {t("off")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {product.images?.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100"
                >
                  <Link href={image} target="_blank" rel="noopener noreferrer" className="">
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-24 object-cover rounded-xl hover:blur-sm transition-all duration-300"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm border border-green-200 shadow-sm">
                {product.category?.name || t("uncategorized")}
              </span>
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm border border-green-200 shadow-sm">
                {product.brand?.name || t("noBrand")}
              </span>
              {product.isFeatured && (
                <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full font-semibold text-sm border border-amber-200 shadow-sm">
                  ⭐ {t("featured")}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(product.averageRating || 0, "lg")}
                <span className="text-lg font-semibold text-gray-700">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600 font-medium">
                {product.numReviews || 0} {t("reviews")}
              </span>
              <span className="text-gray-500">•</span>
              <span
                className={`font-bold ${
                  product.countInStock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.countInStock > 0 ? t("inStock") : t("outOfStock")} ({product.countInStock})
              </span>
            </div>

            <div className="space-y-3">
              {hasDiscount ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(product.discountPrice, product, "discount")}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      {formatPrice(product.price, product, "price")}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {t("save")} {formatPrice(product.price - product.discountPrice, product, "diff")}
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price, product, "price")}
                </span>
              )}
            </div>

            <div
              className="text-lg text-gray-700 leading-relaxed border-t border-gray-100 pt-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="space-y-6 border-t border-gray-100 pt-4">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>{t("size")}</span>
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${
                          selectedSize === size
                            ? "bg-green-600 text-white border-green-600 shadow-lg transform scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:shadow-md"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t("color")}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-xl border-1 transition-all duration-300 shadow-md p-2  text-white ${
                          selectedColor === color
                            ? "border-green-600 scale-110 ring-4 ring-green-200"
                            : "border-gray-200 hover:border-green-400 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("quantity")}
                </h3>
                <div className="flex items-center gap-4 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl text-2xl font-bold text-gray-600 hover:bg-gray-50 hover:border-green-400 transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="w-20 text-center text-xl font-bold bg-white border-2 border-green-200 rounded-xl py-3 text-green-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl text-2xl font-bold text-gray-600 hover:bg-gray-50 hover:border-green-400 transition-all duration-300"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={24} />
                  {product.countInStock === 0 ? t("outOfStock") : t("addToCart")}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`px-6 py-4 rounded-2xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
                    isInWishlist(product._id)
                      ? "bg-red-50 border-red-500 text-red-600 shadow-md"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <Heart size={22} className={isInWishlist(product._id) ? "fill-current text-red-500" : ""} />
                  {isInWishlist(product._id) ? (isRTL ? "في المفضلة" : "In Wishlist") : (isRTL ? "إضافة للمفضلة" : "Add to Wishlist")}
                </button>

                <button
                  onClick={() => {
                    if (isInCompare(product._id)) {
                      removeFromCompare(product._id);
                    } else {
                      addToCompare(product);
                    }
                  }}
                  className={`px-6 py-4 rounded-2xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
                    isInCompare(product._id)
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  <FiGrid size={22} />
                  {isInCompare(product._id) ? t("removeFromCompare") : t("addToCompare")}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">
                    {t("freeShipping")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <RotateCcw className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">
                    {t("dayReturn")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">
                    {t("yearWarranty")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {session ? t("recommendedForYou") : t("youMightAlsoLike")}
                </h2>
                <p className="text-gray-600 mt-2">
                  {session
                    ? t("tailoredToInterests")
                    : t("popularProducts")}
                </p>
              </div>
            </div>

            {recommendationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 shadow-lg animate-pulse"
                  >
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.slice(0, 4).map((recommendedProduct) => (
                  <Link
                    key={recommendedProduct._id}
                    href={`/product/${recommendedProduct._id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={
                          recommendedProduct.images?.[0] ||
                          "/images/placeholder.png"
                        }
                        alt={recommendedProduct.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {recommendedProduct.discountPrice &&
                        recommendedProduct.discountPrice <
                          recommendedProduct.price && (
                          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                            {t("onSale")}
                          </div>
                        )}
                      {recommendedProduct.isFeatured && (
                        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg`}>
                          ⭐
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {recommendedProduct.name}
                      </h3>
                      {recommendedProduct.brand?.name && (
                        <p className="text-xs text-gray-500 mb-2">
                          {t("by")} {recommendedProduct.brand.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {recommendedProduct.discountPrice &&
                          recommendedProduct.discountPrice <
                            recommendedProduct.price ? (
                            <>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(recommendedProduct.discountPrice, recommendedProduct, "discount")}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(recommendedProduct.price, recommendedProduct, "price")}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-800">
                              {formatPrice(recommendedProduct.price || 0, recommendedProduct, "price")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(recommendedProduct.averageRating || 0)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {t("relatedProducts")}
              </h2>
              <Link
                href={`/products?category=${product.category?.slug}`}
                className="group flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
              >
                {t("viewAll")}
                <ArrowRight
                  size={20}
                  className={`group-hover:${isRTL ? "-translate-x-1" : "translate-x-1"} transition-transform ${isRTL ? "rotate-180" : ""}`}
                />
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 shadow-lg animate-pulse"
                  >
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    href={`/product/${relatedProduct._id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={
                          relatedProduct.images?.[0] ||
                          "/images/placeholder.png"
                        }
                        alt={relatedProduct.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {relatedProduct.discountPrice &&
                        relatedProduct.discountPrice < relatedProduct.price && (
                          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                            {t("onSale")}
                          </div>
                        )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {relatedProduct.discountPrice &&
                          relatedProduct.discountPrice <
                            relatedProduct.price ? (
                            <>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(relatedProduct.discountPrice, relatedProduct, "discount")}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(relatedProduct.price, relatedProduct, "price")}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-800">
                              {formatPrice(relatedProduct.price || 0, relatedProduct, "price")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(relatedProduct.averageRating || 0)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-16 lg:mt-20" dir={isRTL ? "rtl" : "ltr"}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              {t("customerReviews")}
            </h2>

            {/* Rating Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-green-100">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                {/* Left Side - Average Rating */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                      {(product.averageRating || 0).toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                      {renderStars(product.averageRating || 0, "lg")}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {product.numReviews || 0}{" "}
                      {product.numReviews === 1 ? t("review") : t("reviews")}
                    </div>
                  </div>

                  {/* Vertical Divider - Hidden on mobile */}
                  <div className="hidden sm:block h-16 lg:h-20 w-px bg-gray-300"></div>

                  {/* Rating Breakdown */}
                  <div className="space-y-1 sm:space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(
                        (r) => r.rating === star
                      ).length;
                      const percentage =
                        (count / (product.numReviews || 1)) * 100;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-4 text-center">
                            {star}
                          </span>
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                          <div className="w-20 sm:w-24 lg:w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-6 sm:w-8 text-center">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write Review Button */}
                {session && (
                  <button
                    onClick={() =>
                      document
                        .getElementById("review-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    {t("writeAReview")}
                  </button>
                )}
              </div>
            </div>

            {/* Review Form */}
            {session && (
              <div
                id="review-form"
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {t("shareYourExperience")}
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                      {t("yourRating")}
                    </label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i + 1)}
                          className="transform hover:scale-110 transition-all duration-200"
                        >
                          <Star
                            className={`w-8 h-8 sm:w-10 sm:h-10 ${
                              i < rating
                                ? "text-amber-400 fill-current"
                                : "text-gray-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3"
                    >
                      {t("yourReview")}
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 resize-none text-sm sm:text-base"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("shareThoughtsPlaceholder")}
                    ></textarea>
                  </div>
                  <button
                    onClick={handleAddReview}
                    disabled={submittingReview}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
                  >
                    {submittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                        <span className="text-sm sm:text-base">
                          {t("submitting")}
                        </span>
                      </>
                    ) : (
                      t("submitReview")
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {reviewLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 text-base sm:text-lg">
                    {t("loadingReviews")}
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💬</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    {t("noReviewsYet")}
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    {t("beFirstToShare")}
                  </p>
                  {!session && (
                    <button
                      onClick={() =>
                        toast.info(t("signInToAddReview"))
                      }
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      {t("signInToReview")}
                    </button>
                  )}
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative group"
                  >
                    {(session?.user?.id === review.user?._id ||
                      session?.user?.role === "admin") && (
                      <>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="hidden sm:flex absolute bottom-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                          title={
                            session.user.role === "admin"
                              ? (isRTL ? "حذف التقييم (مسؤول)" : "Delete review (Admin)")
                              : (isRTL ? "حذف تقييمي" : "Delete my review")
                          }
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="sm:hidden absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Delete review"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        {renderUserAvatar(review)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating, "sm")}
                              <span className="ml-1 sm:ml-2 text-base sm:text-lg font-semibold text-gray-700">
                                {review.rating}.0
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                            <Clock size={12} className="sm:w-3 sm:h-3" />
                            <span>
                              {new Date(review.createdAt).toLocaleDateString(
                                isRTL ? "ar-EG" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                            {review.name || review.user?.name || (isRTL ? "مجهول" : "Anonymous")}
                          </h4>
                          {session?.user?.role === "admin" && (
                            <span className="bg-gradient-to-r from-red-100 to-emerald-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium border border-red-200 w-fit">
                              User ID: {review.user?._id?.slice(-6) || "N/A"}
                            </span>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                            {review.comment}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
                          <CheckCircle
                            size={14}
                            className="sm:w-4 sm:h-4 text-green-500"
                          />
                          <span className="text-xs sm:text-sm text-green-600 font-medium">
                            {t("verifiedPurchase")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
