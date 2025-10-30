"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaSpinner,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaSearch,
  FaExclamationTriangle,
  FaUserCheck,
  FaDownload,
} from "react-icons/fa";

export default function AdminSubscribersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState([]);
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
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/subscribers");
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }
      const data = await response.json();
      setSubscribers(data);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    const result = await Swal.fire({
      title: "Remove Subscriber?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to remove:</p>
          <p class="text-xl text-primary font-bold">${email}</p>
          <p class="text-gray-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Remove It!",
      cancelButtonText: "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/subscribers/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete subscriber");
        }

        await Swal.fire({
          title: "Removed!",
          text: `${email} has been removed from subscribers.`,
          icon: "success",
          confirmButtonColor: "#10b981",

          customClass: {
            popup: "rounded-2xl",
          },
        });

        fetchSubscribers();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to remove subscriber. Please try again later.",
          icon: "error",
          confirmButtonColor: "#ef4444",

          customClass: {
            popup: "rounded-2xl",
          },
        });
      }
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Status,Subscribed Date\n" +
      subscribers
        .map(
          (sub) =>
            `"${sub.email}","${
              sub.verified ? "Verified" : "Not Verified"
            }","${new Date(sub.createdAt).toLocaleDateString()}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: "Exported!",
      text: "Subscribers list has been exported as CSV.",
      icon: "success",
      confirmButtonColor: "#10b981",
    });
  };

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verifiedCount = subscribers.filter((sub) => sub.verified).length;
  const unverifiedCount = subscribers.filter((sub) => !sub.verified).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Subscribers...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch your subscriber list
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
                  Subscriber Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary" />
                  Manage your newsletter subscribers and email list
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-8 rounded-xl"
              disabled={subscribers.length === 0}
            >
              <FaDownload className="text-lg" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUsers className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {subscribers.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Subscribers</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-3xl text-success" />
                <span className="text-3xl font-bold text-gray-800">
                  {verifiedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Verified</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaTimesCircle className="text-3xl text-error" />
                <span className="text-3xl font-bold text-gray-800">
                  {unverifiedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Not Verified</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search subscribers by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaEnvelope className="text-primary" />
                <span>
                  {filteredSubscribers.length}{" "}
                  {filteredSubscribers.length === 1
                    ? "subscriber"
                    : "subscribers"}{" "}
                  found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No subscribers found" : "No subscribers yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Subscribers will appear here once they sign up for your newsletter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Email Address
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Subscribed On
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-primary flex-shrink-0" />
                          <span className="font-medium text-gray-800">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`badge badge-lg gap-2 ${
                            subscriber.verified
                              ? "badge-success text-white"
                              : "badge-error text-white"
                          }`}
                        >
                          {subscriber.verified ? (
                            <>
                              <FaCheckCircle />
                              Verified
                            </>
                          ) : (
                            <>
                              <FaTimesCircle />
                              Not Verified
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          {new Date(subscriber.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            handleDelete(subscriber._id, subscriber.email)
                          }
                          className="btn btn-error btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <FaTrash className="text-sm" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredSubscribers.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaUsers className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {subscribers.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Subscribers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaUserCheck className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {verifiedCount} (
                    {Math.round((verifiedCount / subscribers.length) * 100)}%)
                  </p>
                  <p className="text-sm text-gray-600">Verified Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
