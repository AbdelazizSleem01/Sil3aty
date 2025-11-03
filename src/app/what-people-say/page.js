"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaUser,
  FaSmile,
  FaHeart,
} from "react-icons/fa";
import { IoSparkles, IoPeople, IoStar } from "react-icons/io5";

export default function WhatPeopleSayPage() {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch("/api/feedback");
        if (!response.ok) throw new Error("Failed to fetch feedback");
        const data = await response.json();
        setFeedbacks(data);

        if (data.length > 0) {
          const totalRating = data.reduce(
            (sum, feedback) => sum + feedback.rating,
            0
          );
          const avg = totalRating / data.length;
          setAverageRating(avg.toFixed(1));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= feedbacks.length ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? feedbacks.length - 1 : prevIndex - 1
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1 justify-center lg:justify-start">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className="text-yellow-400 text-sm sm:text-base lg:text-lg"
          >
            {star <= rating ? (
              <FaStar className="fill-current" />
            ) : star - 0.5 <= rating ? (
              <FaStarHalfAlt className="fill-current" />
            ) : (
              <FaRegStar className="fill-current" />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 font-mono px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-gray-600 text-base sm:text-lg">
            {t("loadingTestimonials")}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-emerald-50 px-4">
        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">⚠️</span>
          </div>
          <span className="text-red-600 text-base sm:text-lg">
            Error: {error}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <IoPeople className="text-2xl sm:text-3xl text-white" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <IoSparkles className="text-xs sm:text-sm text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl pb-2 md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-2">
            {t("whatPeopleSay")}
          </h1>

          <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full mx-auto mb-4 sm:mb-6"></div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              {t("discoverClientExperience")}
            </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 mt-6 text-gray-500 text-sm sm:text-base">
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-400 text-sm" />
            <span>{feedbacks.length}+ {t("reviews")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoStar className="text-yellow-400 text-sm" />
              <span>
                {feedbacks.length > 0
                  ? `${averageRating} ${t("averageRating")}`
                  : t("noRatingsYet")}
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl mx-2 sm:mx-0">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {feedbacks.map((feedback, index) => (
                <div
                  key={feedback._id}
                  className="w-full flex-shrink-0 px-2 sm:px-4"
                >
                  <div
                    className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-4 sm:p-6 lg:p-8 h-full border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 ${
                      index === currentIndex
                        ? "ring-1 sm:ring-2 ring-green-200"
                        : ""
                    }`}
                  >
                    {/* Quote Icon */}
                    <div className="text-right mb-3 sm:mb-4">
                      <FaQuoteLeft className="text-2xl sm:text-3xl lg:text-4xl text-green-100 inline-block" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
                      {/* User Info */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-1 text-center sm:text-left w-full">
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 p-0.5 shadow-lg">
                            <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white p-0.5">
                              <img
                                loading="lazy"
                                src={
                                  feedback.userImage ||
                                  "/images/default-avatar.png"
                                }
                                alt={feedback.name}
                                className="w-full h-full rounded-xl sm:rounded-2xl object-cover"
                              />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-green-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                            <FaSmile className="text-white text-xs" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                            {feedback.name}
                          </h3>
                          <p className="text-green-600 font-medium text-sm sm:text-base">
                            {feedback.role}
                          </p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1 hidden sm:block">
                            {feedback.email}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex flex-col items-center space-y-2 w-full sm:w-auto">
                        {renderStars(feedback.rating)}
                        <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                          {feedback.rating}.0
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {feedback.rating === 5
                            ? t("excellent")
                            : feedback.rating >= 4
                            ? t("great")
                            : feedback.rating >= 3
                            ? t("good")
                            : t("fair")}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <blockquote className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed bg-gradient-to-r from-gray-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-2 sm:border-l-4 border-green-400">
                      <div className="flex">
                        <FaQuoteLeft className="text-green-300 text-base sm:text-xl mx-2 sm:mx-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <p className="italic text-justify">
                          {feedback.comment}
                        </p>
                      </div>
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex absolute inset-y-0 -left-4 lg:-left-6 items-center">
            <button
              onClick={goToPrev}
              className="btn bg-white text-green-600 border-2 border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-110 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center"
            >
              <FaChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
          <div className="hidden sm:flex absolute inset-y-0 -right-4 lg:-right-6 items-center">
            <button
              onClick={goToNext}
              className="btn bg-white text-green-600 border-2 border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-110 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center"
            >
              <FaChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>

          <div className="flex sm:hidden justify-center space-x-4 mt-6">
            <button
              onClick={goToPrev}
              className="btn bg-white text-green-600 border-2 border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-600 hover:text-white w-12 h-12 flex items-center justify-center"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="btn bg-white text-green-600 border-2 border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-600 hover:text-white w-12 h-12 flex items-center justify-center"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {feedbacks.length > 1 && (
          <div className="flex justify-center mt-8 sm:mt-12 space-x-2 sm:space-x-3">
            {feedbacks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-primary to-emerald-500 w-6 sm:w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <p className="text-gray-500 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="flex items-center space-x-2">
              <FaHeart className="text-red-400 animate-pulse" />
              <span>{t("thankYouForTrust")}</span>
              <FaHeart className="text-red-400 animate-pulse" />
            </span>
          </p>
        </div>

        <div className="sm:hidden text-center mt-6">
          <p className="text-gray-400 text-xs">
            {t("swipeNavigateReviews")}
          </p>
        </div>
      </div>
    </div>
  );
}
