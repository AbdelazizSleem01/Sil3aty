"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
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
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.isAdmin === true) {
      fetchAllReviews();
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [session, status]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/reviews");
      setReviews(data);
      toast.success("Reviews loaded successfully!");
    } catch (error) {
      toast.error("❌ Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId, userName, productName) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to delete review for:</p>
          <p class="text-xl text-primary font-bold">${productName}</p>
          <p class="text-gray-600 mt-2">by ${userName}</p>
          <p class="text-gray-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete It!",
      cancelButtonText: "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/reviews?id=${reviewId}`);
        toast.success("🗑️ Review deleted successfully");
        fetchAllReviews();
      } catch (error) {
        toast.error(
          `❌ ${error.response?.data?.message || "Failed to delete review"}`
        );
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/reviews");
      setReviews(data);
      toast.info("Reviews list refreshed!");
    } catch (error) {
      toast.error("❌ Failed to refresh reviews");
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
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaComment className="text-primary" />
            <span>Loading Reviews...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch customer reviews
          </p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (session?.user?.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-error/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-3xl font-bold text-error mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6 text-lg">
            You need admin privileges to access this page.
          </p>
          <div className="bg-base-100 p-6 rounded-2xl border border-base-300 shadow-lg space-y-4 text-left">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="w-5 h-5 text-warning" />
              <span className="text-sm">
                <strong>Admin Status:</strong>{" "}
                {session?.user?.isAdmin?.toString() || "false"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-info" />
              <span className="text-sm">
                <strong>User ID:</strong> {session?.user?.id}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <strong>Email:</strong> {session?.user?.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <strong>Name:</strong> {session?.user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaComment className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Review Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  Manage and monitor customer reviews and ratings
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-8 rounded-xl"
            >
              <FaSync className="text-lg" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaComment className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {reviews.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Reviews</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaStar className="text-3xl text-amber-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {averageRating}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Average Rating</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaStar className="text-3xl text-green-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {ratingDistribution[5]}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">5-Star Reviews</p>
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
              <p className="text-gray-600 font-semibold">Satisfaction Rate</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search reviews by product, user, or comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaComment className="text-primary" />
                <span>
                  {filteredReviews.length}{" "}
                  {filteredReviews.length === 1 ? "review" : "reviews"} found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No reviews found" : "No reviews yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Customer reviews will appear here once they submit their feedback."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Product & User
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Comment
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Actions
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
                              by{" "}
                              {review.user?.name || review.name || "Anonymous"}
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
                            {review.comment || "No comment provided"}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
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
                          className="btn btn-error btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <FaTrash className="text-sm" />
                          Delete
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
                  <p className="text-sm text-gray-600">Total Reviews</p>
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
                  <p className="text-sm text-gray-600">Average Rating</p>
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
                  <p className="text-sm text-gray-600">5-Star Percentage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
