"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaStar,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaSearch,
  FaEnvelope,
  FaUser,
  FaComment,
  FaCalendar,
  FaChartBar,
  FaSync,
  FaEye,
} from "react-icons/fa";

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/feedback");
        if (!response.ok) throw new Error("Failed to fetch feedback");
        const data = await response.json();
        setFeedbacks(data);
        toast.success("Feedback loaded successfully!");
      } catch (err) {
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, userName) => {
    Swal.fire({
      title: "Delete Feedback?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to delete feedback from:</p>
          <p class="text-xl text-primary font-bold">${userName}</p>
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/feedback/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete feedback");

          setFeedbacks(feedbacks.filter((fb) => fb._id !== id));
          toast.success("🗑️ Feedback deleted successfully");

          Swal.fire({
            title: "Deleted!",
            text: "Feedback has been removed successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          toast.error(`❌ ${error.message}`);
        }
      }
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback");
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedbacks(data);
      toast.info("Feedback list refreshed!");
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
        ).toFixed(1)
      : 0;

  const ratingDistribution = {
    5: feedbacks.filter((fb) => fb.rating === 5).length,
    4: feedbacks.filter((fb) => fb.rating === 4).length,
    3: feedbacks.filter((fb) => fb.rating === 3).length,
    2: feedbacks.filter((fb) => fb.rating === 2).length,
    1: feedbacks.filter((fb) => fb.rating === 1).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Feedback...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch customer feedback
          </p>
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
                <FaUsers className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Feedback Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  Manage and review customer feedback and ratings
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
                <FaUsers className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {feedbacks.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Feedback</p>
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
                  {feedbacks.length > 0
                    ? Math.round(
                        (ratingDistribution[5] / feedbacks.length) * 100
                      )
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
                    placeholder="Search feedback by name, email, role, or comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaUsers className="text-primary" />
                <span>
                  {filteredFeedbacks.length}{" "}
                  {filteredFeedbacks.length === 1 ? "entry" : "entries"} found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No feedback found" : "No feedback yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Customer feedback will appear here once they submit their reviews."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Comment
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Rating
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
                  {filteredFeedbacks.map((feedback, index) => (
                    <tr
                      key={feedback._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-white rounded-full w-12 text-center pt-2">
                              <span className="text-lg font-bold">
                                {feedback.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {feedback.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaEnvelope className="text-xs" />
                              {feedback.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="badge badge-primary badge-lg capitalize">
                          {feedback.role}
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-2">
                          <FaComment className="text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-gray-600 line-clamp-2 hover:line-clamp-none transition-all cursor-help">
                            {feedback.comment}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= feedback.rating
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-800 bg-amber-50 px-2 py-1 rounded">
                            {feedback.rating}/5
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          {new Date(feedback.createdAt).toLocaleDateString(
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
                            handleDelete(feedback._id, feedback.name)
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

        {filteredFeedbacks.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaUsers className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {feedbacks.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Feedback</p>
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
                    {feedbacks.length > 0
                      ? Math.round(
                          (ratingDistribution[5] / feedbacks.length) * 100
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
