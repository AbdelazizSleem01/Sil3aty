"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  FaStar,
  FaTrash,
  FaSync,
  FaLock,
  FaUser,
  FaComment,
  FaCalendar,
  FaBox,
  FaShieldAlt,
  FaSearch,
  FaExclamationCircle,
  FaUsers,
  FaChartBar,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function AdminReviewsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const localT = {
    ar: {
      reviewManagement: "إدارة التقييمات",
      manageReviews: "إدارة ومراقبة تقييمات وتعليقات العملاء",
      totalReviews: "إجمالي التقييمات",
      averageRating: "متوسط التقييم",
      fiveStarReviews: "تقييمات 5 نجوم",
      satisfactionRate: "معدل الرضا",
      searchPlaceholder: "البحث عن تقييمات بالمنتج، المستخدم، أو التعليق...",
      reviewsFound: "تقييمات تم العثور عليها",
      reviewFound: "تقييم تم العثور عليه",
      noReviewsFound: "لم يتم العثور على تقييمات",
      noReviewsYet: "لا توجد تقييمات بعد",
      searchAdjust: "حاول تغيير كلمات البحث للعثور على ما تبحث عنه.",
      customerFeedback: "ستظهر تقييمات العملاء هنا بمجرد تقديمهم لآرائهم.",
      productUser: "المنتج والمستخدم",
      rating: "التقييم",
      comment: "التعليق",
      date: "التاريخ",
      actions: "الإجراءات",
      delete: "حذف",
      by: "بواسطة",
      anonymous: "مجهول",
      noComment: "لا يوجد تعليق",
      loadingReviews: "جاري تحميل التقييمات...",
      pleaseWait: "يرجى الانتظار بينما نقوم بجلب مراجعات العملاء...",
      accessDenied: "تم رفض الوصول",
      needAdmin: "أنت بحاجة إلى صلاحيات مدير للوصول إلى هذه الصفحة.",
      adminStatus: "حالة المسؤول:",
      userId: "معرف المستخدم:",
      email: "البريد الإلكتروني:",
      name: "الاسم:",
      confirmDeleteTitle: "حذف التقييم؟",
      confirmDeleteHtml: "أنت على وشك حذف تقييم لـ:",
      confirmDeleteWarning: "لا يمكن التراجع عن هذا الإجراء!",
      yesDelete: "نعم، قم بالحذف!",
      cancel: "إلغاء",
      reviewDeleted: "🗑️ تم حذف التقييم بنجاح",
      failedDelete: "فشل حذف التقييم",
      failedLoadReviews: "❌ فشل تحميل التقييمات",
      fiveStarPercentage: "نسبة الـ 5 نجوم"
    },
    en: {
      reviewManagement: "Review Management",
      manageReviews: "Manage and monitor customer reviews and ratings",
      totalReviews: "Total Reviews",
      averageRating: "Average Rating",
      fiveStarReviews: "5-Star Reviews",
      satisfactionRate: "Satisfaction Rate",
      searchPlaceholder: "Search reviews by product, user, or comment...",
      reviewsFound: "reviews found",
      reviewFound: "review found",
      noReviewsFound: "No reviews found",
      noReviewsYet: "No reviews yet",
      searchAdjust: "Try adjusting your search terms to find what you're looking for.",
      customerFeedback: "Customer reviews will appear here once they submit their feedback.",
      productUser: "Product & User",
      rating: "Rating",
      comment: "Comment",
      date: "Date",
      actions: "Actions",
      delete: "Delete",
      by: "by",
      anonymous: "Anonymous",
      noComment: "No comment provided",
      loadingReviews: "Loading Reviews...",
      pleaseWait: "Please wait while we fetch customer reviews",
      accessDenied: "Access Denied",
      needAdmin: "You need admin privileges to access this page.",
      adminStatus: "Admin Status:",
      userId: "User ID:",
      email: "Email:",
      name: "Name:",
      confirmDeleteTitle: "Delete Review?",
      confirmDeleteHtml: "You are about to delete review for:",
      confirmDeleteWarning: "This action cannot be undone!",
      yesDelete: "Yes, Delete It!",
      cancel: "Cancel",
      reviewDeleted: "🗑️ Review deleted successfully",
      failedDelete: "Failed to delete review",
      failedLoadReviews: "❌ Failed to load reviews",
      fiveStarPercentage: "5-Star Percentage"
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.isAdmin === true) {
      fetchAllReviews();
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [session, status, isRTL]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/reviews");
      setReviews(data);
    } catch (error) {
      toast.error(currentT.failedLoadReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId, userName, productName) => {
    const result = await Swal.fire({
      title: currentT.confirmDeleteTitle,
      html: `
        <div class="text-center" dir="${isRTL ? "rtl" : "ltr"}">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${currentT.confirmDeleteHtml}</p>
          <p class="text-xl text-primary font-bold">${productName}</p>
          <p class="text-gray-600 mt-2">${currentT.by} ${userName}</p>
          <p class="text-gray-600 mt-2">${currentT.confirmDeleteWarning}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: currentT.yesDelete,
      cancelButtonText: currentT.cancel,

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/reviews?id=${reviewId}`);
        toast.success(currentT.reviewDeleted);
        fetchAllReviews();
      } catch (error) {
        toast.error(
          `❌ ${error.response?.data?.message || currentT.failedDelete}`
        );
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/reviews");
      setReviews(data);
      toast.info(isRTL ? "تم تحديث قائمة التقييمات!" : "Reviews list refreshed!");
    } catch (error) {
      toast.error(currentT.failedLoadReviews);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  const ratingDistribution = {
    5: reviews.filter((review) => review.rating === 5).length,
    4: reviews.filter((review) => review.rating === 4).length,
    3: reviews.filter((review) => review.rating === 3).length,
    2: reviews.filter((review) => review.rating === 2).length,
    1: reviews.filter((review) => review.rating === 1).length,
  };

  // Show loading while checking session
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaSync className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700 justify-center">
            <FaComment className="text-primary" />
            <span>{currentT.loadingReviews}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {currentT.pleaseWait}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (session?.user?.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center max-w-md mx-4">
          <div className="bg-error/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-3xl font-bold text-error mb-4">{currentT.accessDenied}</h2>
          <p className="text-gray-600 mb-6 text-lg">
            {currentT.needAdmin}
          </p>
          <div className={`bg-base-100 p-6 rounded-2xl border border-base-300 shadow-lg space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="flex items-center gap-3">
              <FaShieldAlt className="w-5 h-5 text-warning" />
              <span className="text-sm">
                <strong>{currentT.adminStatus}</strong>{" "}
                {session?.user?.isAdmin?.toString() || "false"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-info" />
              <span className="text-sm">
                <strong>{currentT.userId}</strong> {session?.user?.id}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <strong>{currentT.email}</strong> {session?.user?.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <strong>{currentT.name}</strong> {session?.user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaComment className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {currentT.reviewManagement}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  {currentT.manageReviews}
                </p>
              </div>
            </div>

            {/* Removed Refresh Button */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaComment className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {reviews.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.totalReviews}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaStar className="text-3xl text-amber-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {averageRating}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.averageRating}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaStar className="text-3xl text-green-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {ratingDistribution[5]}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.fiveStarReviews}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaChartBar className="text-3xl text-emerald-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {reviews.length > 0
                    ? Math.round((ratingDistribution[5] / reviews.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.satisfactionRate}</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400 text-lg`} />
                  <input
                    type="text"
                    placeholder={currentT.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input input-bordered input-lg w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaComment className="text-primary" />
                <span>
                  {filteredReviews.length}{" "}
                  {filteredReviews.length === 1 ? currentT.reviewFound : currentT.reviewsFound}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? currentT.noReviewsFound : currentT.noReviewsYet}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? currentT.searchAdjust : currentT.customerFeedback}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.productUser}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.rating}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.comment}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.date}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.actions}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review, index) => (
                    <tr
                      key={review._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {review.user?.profilePicture ? (
                                <Image
                                  src={review.user.profilePicture}
                                  alt={review.user?.name || "User"}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                                {review.user?.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FaBox className="text-gray-400 text-sm" />
                              <div className="font-semibold text-gray-800 truncate max-w-[200px]">
                                {review.product?.name || "Unknown Product"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaUser className="text-gray-400 text-xs" />
                              {currentT.by}{" "}
                              {review.user?.name || review.name || currentT.anonymous}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {review.user?._id?.slice(-8) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-800 bg-amber-50 px-2 py-1 rounded">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-2">
                          <FaComment className="text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-gray-600 line-clamp-2 hover:line-clamp-none transition-all cursor-help leading-relaxed">
                            {review.comment || currentT.noComment}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          {new Date(review.createdAt).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            handleDeleteReview(
                              review._id,
                              review.user?.name || "User",
                              review.product?.name || "Product"
                            )
                          }
                          className="btn btn-error btn-sm flex items-center justify-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-white"
                        >
                          <FaTrash className="text-sm" />
                          {currentT.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredReviews.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaComment className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {reviews.length}
                  </p>
                  <p className="text-sm text-gray-600">{currentT.totalReviews}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <FaStar className="text-amber-500 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {averageRating}/5
                  </p>
                  <p className="text-sm text-gray-600">{currentT.averageRating}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FaChartBar className="text-green-500 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {reviews.length > 0
                      ? Math.round(
                          (ratingDistribution[5] / reviews.length) * 100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600">{currentT.fiveStarPercentage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
