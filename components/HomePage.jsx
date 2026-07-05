"use client";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import SpinWheelModal from "./SpinWheelModal";
import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { useCompare } from "./CompareContext";
import { useWishlist } from "./WishlistContext";
import { FiGrid } from "react-icons/fi";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
  Zap,
  Shield,
  Truck,
  BookOpen,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  CheckCircle,
  Users,
  Award,
  TrendingUp,
  Play,
} from "lucide-react";

// Lazy load sections for better performance
const NewsletterSection = dynamic(() => import("@/app/subscribe/page"), { ssr: false });
const FeedbackForm = dynamic(() => import("@/app/feedback/page"), { ssr: false });
const WhatPeopleSayPage = dynamic(() => import("@/app/what-people-say/page"), { ssr: false });
const CategoryProductsPage = dynamic(() => import("@/app/category/page"), { ssr: false });
const FeaturedProductsPage = dynamic(() => import("@/app/featured-products/page"), { ssr: false });
const TopSellingProductsPage = dynamic(() => import("@/app/top-selling/page"), { ssr: false });
const OurTeam = dynamic(() => import("@/app/ourTeam/page"), { ssr: false });
const DiscountedProductsPage = dynamic(() => import("@/app/discounted/page"), { ssr: false });
const BrandsPage = dynamic(() => import("@/app/brands/page"), { ssr: false });

function CountdownTimer({ endDate, format = "hours" }) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (
    timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds ===
    0
  ) {
    return (
      <span className="text-red-500 text-sm font-bold">{t("expired")}</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {format === "days" && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{timeLeft.days}</div>
          <div className="text-xs text-gray-600">{t("days")}</div>
        </div>
      )}
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{timeLeft.hours}</div>
        <div className="text-xs text-gray-600">{t("hours")}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">
          {timeLeft.minutes}
        </div>
        <div className="text-xs text-gray-600">{t("min")}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">
          {timeLeft.seconds}
        </div>
        <div className="text-xs text-gray-600">{t("sec")}</div>
      </div>
    </div>
  );
}

function LimitedTimeOffersSection() {
  const { t } = useTranslation();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { data: discountedData, error: discountedError } = useSWR("/api/products/discounted");

  const limitedOffers = discountedData
    ? discountedData.filter((p) => p.discountEndDate).slice(0, 4)
    : [];

  const loading = !discountedData && !discountedError;

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t("limitedTimeOffers")}
          </h2>
          <p className="text-gray-600">{t("actFast")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg animate-pulse p-6"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!limitedOffers.length) return null;

  return (
    <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Zap className="w-4 h-4" />
          {t("flashSale")}
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {t("limitedTimeOffers")}
        </h2>
        <p className="text-gray-600">{t("dontMissDeals")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {limitedOffers.map((product) => {
          const discountPercent =
            product.discountPercentage ||
            Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            );

          return (
            <div
              key={product._id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-red-200 overflow-hidden"
            >
              <div className="relative p-4 pb-0">
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  {discountPercent}
                  {t("off")}
                </div>

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
                  className={`absolute top-2 left-2 z-10 p-2 rounded-full transition-all duration-300 shadow-md ${
                    isInCompare(product._id)
                      ? "bg-emerald-500 text-white scale-110"
                      : "bg-white/95 backdrop-blur-sm text-gray-500 hover:text-emerald-500 hover:bg-white hover:scale-105"
                  }`}
                  title={t("compare")}
                >
                  <FiGrid size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className={`absolute top-12 left-2 z-10 p-2 rounded-full transition-all duration-300 shadow-md ${
                    isInWishlist(product._id)
                      ? "bg-red-500 text-white scale-110"
                      : "bg-white/95 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white hover:scale-105"
                  }`}
                  title={t("wishlist")}
                >
                  <Heart size={14} className={isInWishlist(product._id) ? "fill-current" : ""} />
                </button>

                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 9.5l2.5 3.01L14.5 7l4.5 6H5l3.5-4.5z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-red-600">
                      ${product.discountPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${product.price}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    {t("save")}
                    {(product.price - product.discountPrice).toFixed(2)}
                  </span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex flex-col items-center justify-center">
                  <div className="text-xs text-red-600 font-semibold mb-1 text-center">
                    {t("timeLeft")}
                  </div>
                  <CountdownTimer
                    endDate={product.discountEndDate}
                    format="hours"
                  />
                </div>

                <Link
                  href={`/product/${product._id}`}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  <Zap className="w-4 h-4" />
                  {t("shopNowLimited")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/discounted"
          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {t("viewAllLimitedOffers")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isVisible, setIsVisible] = useState(false);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    setIsVisible(true);

    const generatedDots = Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
    }));
    setDots(generatedDots);

    const fetchLatestBlogs = async () => {
      try {
        const response = await fetch("/api/blog");
        if (response.ok) {
          const blogs = await response.json();
          setLatestBlogs(blogs.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchLatestBlogs();

    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        isRTL ? "font-arabic rtl-text" : ""
      }`}
    >
      <section className="relative min-h-screen pt-8 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzEwYTE0MCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+")`, backgroundSize: '60px 60px', opacity: 0.4 }}>
        </div>

        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full mix-blend-multiply opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-teal-200 to-cyan-300 rounded-full mix-blend-multiply opacity-40 animate-float-slow delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-lime-200 to-green-300 rounded-full mix-blend-multiply opacity-30 animate-pulse-slow"></div>

        <div className="absolute inset-0">
          {dots.map((dot, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20 animate-float"
              style={{
                left: dot.left,
                top: dot.top,
                animationDelay: dot.animationDelay,
                animationDuration: dot.animationDuration,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div
              className={`text-center lg:text-left transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-lg border border-green-200 rounded-full px-6 py-3 mb-8 shadow-lg animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-semibold text-sm tracking-wide">
                    {t("premiumShoppingExperience")}
                  </span>
                </div>
              </div>

              <h1
                className={`text-4xl  ${
                  i18n.language === "ar" ? "sm:text-right " : " "
                }  sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6`}
              >
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-transparent bg-clip-text animate-gradient">
                  {t("elevateYourShoppingStyle")}
                </span>
              </h1>

              <p
                className={`text-lg sm:text-xl ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                } md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed font-light`}
              >
                {t("discoverCuratedCollections")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  t("freeShippingWorldwide"),
                  t("customerSupport"),
                  t("securePayment"),
                  t("qualityGuarantee"),
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <Link
                  href="/product"
                  className="group relative flex items-center gap-3 justify-center  bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95 overflow-hidden  sm:w-auto text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="relative  whitespace-nowrap">
                    {t("startShopping")}
                  </span>
                </Link>

                <Link
                  href="/about-us"
                  className="group btn btn-outline flex items-center gap-2 text-green-700 hover:text-emerald-800 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 w-full sm:w-auto justify-center hover:bg-transparent"
                >
                  <Play className="w-4 h-4" />
                  {t("watchDemo")}
                </Link>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-12">
                {[
                  { number: "50K+", label: t("happyCustomers"), icon: Users },
                  { number: "2K+", label: t("premiumProducts"), icon: Award },
                  {
                    number: "98%",
                    label: t("satisfactionRate"),
                    icon: TrendingUp,
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                        {stat.number}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:block hidden">
              <div className="relative group -top-24">
                <div className="absolute -inset-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-glow"></div>

                <div className="relative rounded-2xl overflow-hidden transform transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                  <Image
                    className="object-cover w-full h-auto"
                    src="/images/banner3.png"
                    alt="Sil3aty - Premium Shopping Experience"
                    width={600}
                    height={600}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300 rounded-full animate-spin-slow opacity-50"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-emerald-300 rounded-full animate-spin-slow reverse opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProductsPage />
      <DiscountedProductsPage />
      <LimitedTimeOffersSection />
      <TopSellingProductsPage />
      <CategoryProductsPage />

      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-green-100">
            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Truck className="w-12 h-12 text-emerald-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
              {t("fastShipping")}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {t("worldwideDelivery")}
            </p>
          </div>

          <div className="group p-8 bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-emerald-100">
            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-12 h-12 text-green-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
              {t("securePayments")}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {t("sslEncryption")}
            </p>
          </div>

          <div className="group p-8 bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-teal-100">
            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Star className="w-12 h-12 text-yellow-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
              {t("premiumQuality")}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {t("authenticProducts")}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-20">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <span>{t("latest")}</span>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
              {t("insights")}
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center">
            {t("stayUpdated")}
          </p>
        </div>

        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 animate-pulse overflow-hidden"
              >
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogs.map((blog) => (
              <div
                key={blog._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 overflow-hidden"
              >
                <div className="relative overflow-hidden h-48 w-full bg-white">
                  <Image
                    src={blog.coverImage || "/images/default-blog.jpg"}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    {blog.featured && (
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full">
                        {t("featured")}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs rounded-full">
                      {blog.difficulty || t("beginner")}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                      <span>{blog.author?.name || t("unknownAuthor")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {blog.estimatedReadTime || 5} {t("minRead")}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-green-600 transition-colors duration-300 mb-3 line-clamp-2">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="hover:no-underline hover:text-emerald-700"
                    >
                      {blog.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
                    {blog.excerpt || t("readThisBlog")}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{blog.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{blog.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{blog.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 border border-green-200 text-green-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 group-hover:scale-105"
                    >
                      {t("readMore")}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className=" py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-center font-semibold text-gray-600 mb-2">
              {t("noBlogPostsYet")}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {t("beFirstToShare")}
            </p>
            <Link
              href="/blogs/create"
              className="flex justify-center mx-auto items-center w-fit gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t("createFirstPost")}
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-8 py-4 rounded-2xl transition-all duration-300"
          >
            {t("viewAllPosts")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <WhatPeopleSayPage />
      <FeedbackForm />
      <OurTeam />
      <NewsletterSection />
      <BrandsPage />

      <section className="relative py-20 bg-gradient-to-r from-green-600 to-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            {t("readyToElevate")}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-center">
            {t("joinThousands")}
          </p>
          <Link
            href="/product"
            className="inline-flex items-center gap-3 bg-white text-green-600 font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            <Zap className="w-5 h-5" />
            {t("startShoppingNow")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        @keyframes glow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow.reverse {
          animation-direction: reverse;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .font-arabic {
          font-family: "Cairo", "Geeza Pro", sans-serif;
        }
      `}</style>
      <SpinWheelModal />
    </div>
  );
}
