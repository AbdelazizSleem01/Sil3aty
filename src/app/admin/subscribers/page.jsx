"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();

  const localT = {
    ar: {
      subscriberManagement: "إدارة المشتركين",
      manageSubscribers: "إدارة المشتركين في النشرة البريدية وقائمة البريد الإلكتروني",
      exportCsv: "تصدير CSV",
      totalSubscribers: "إجمالي المشتركين",
      verified: "مفعل",
      notVerified: "غير مفعل",
      searchPlaceholder: "البحث عن مشتركين بالبريد الإلكتروني...",
      subscribersFound: "مشتركين تم العثور عليهم",
      subscriberFound: "مشترك تم العثور عليه",
      noSubscribersFound: "لم يتم العثور على مشتركين",
      noSubscribersYet: "لا يوجد مشتركين حالياً",
      searchAdjust: "حاول تغيير كلمات البحث للعثور على ما تبحث عنه.",
      signNewsletter: "سيظهر المشتركون هنا بمجرد تسجيلهم في النشرة الإخبارية الخاصة بك.",
      emailAddress: "عنوان البريد الإلكتروني",
      status: "الحالة",
      subscribedOn: "تاريخ الاشتراك",
      actions: "الإجراءات",
      remove: "إزالة",
      verifiedRate: "معدل التفعيل",
      loadingSubscribers: "جاري تحميل المشتركين...",
      pleaseWait: "يرجى الانتظار بينما نتحقق من قائمة المشتركين...",
      confirmRemoveTitle: "إزالة المشترك؟",
      confirmRemoveHtml: "أنت على وشك إزالة المشترك:",
      confirmRemoveWarning: "لا يمكن التراجع عن هذا الإجراء!",
      yesRemove: "نعم، قم بالإزالة!",
      cancel: "إلغاء",
      removedTitle: "تمت الإزالة!",
      removedSuccess: "تمت إزالة {email} من المشتركين بنجاح.",
      exportedTitle: "تم التصدير!",
      exportedSuccess: "تم تصدير قائمة المشتركين كـ CSV.",
      errorTitle: "خطأ!",
      failedRemove: "فشل إزالة المشترك. يرجى المحاولة مرة أخرى لاحقاً.",
      fetchFailed: "فشل تحميل المشتركين"
    },
    en: {
      subscriberManagement: "Subscriber Management",
      manageSubscribers: "Manage your newsletter subscribers and email list",
      exportCsv: "Export CSV",
      totalSubscribers: "Total Subscribers",
      verified: "Verified",
      notVerified: "Not Verified",
      searchPlaceholder: "Search subscribers by email...",
      subscribersFound: "subscribers found",
      subscriberFound: "subscriber found",
      noSubscribersFound: "No subscribers found",
      noSubscribersYet: "No subscribers yet",
      searchAdjust: "Try adjusting your search terms to find what you're looking for.",
      signNewsletter: "Subscribers will appear here once they sign up for your newsletter.",
      emailAddress: "Email Address",
      status: "Status",
      subscribedOn: "Subscribed On",
      actions: "Actions",
      remove: "Remove",
      verifiedRate: "Verified Rate",
      loadingSubscribers: "Loading Subscribers...",
      pleaseWait: "Please wait while we fetch your subscriber list",
      confirmRemoveTitle: "Remove Subscriber?",
      confirmRemoveHtml: "You are about to remove:",
      confirmRemoveWarning: "This action cannot be undone!",
      yesRemove: "Yes, Remove It!",
      cancel: "Cancel",
      removedTitle: "Removed!",
      removedSuccess: "has been removed from subscribers.",
      exportedTitle: "Exported!",
      exportedSuccess: "Subscribers list has been exported as CSV.",
      errorTitle: "Error!",
      failedRemove: "Failed to remove subscriber. Please try again later.",
      fetchFailed: "Failed to fetch subscribers"
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;
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
  }, [isRTL]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/subscribers");
      if (!response.ok) {
        throw new Error(currentT.fetchFailed);
      }
      const data = await response.json();
      setSubscribers(data);
    } catch (error) {
      Swal.fire({
        title: currentT.errorTitle,
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
      title: currentT.confirmRemoveTitle,
      html: `
        <div class="text-center" dir="${isRTL ? "rtl" : "ltr"}">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${currentT.confirmRemoveHtml}</p>
          <p class="text-xl text-primary font-bold">${email}</p>
          <p class="text-gray-600 mt-2">${currentT.confirmRemoveWarning}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: currentT.yesRemove,
      cancelButtonText: currentT.cancel,

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
          throw new Error(isRTL ? "فشل حذف المشترك" : "Failed to delete subscriber");
        }

        await Swal.fire({
          title: currentT.removedTitle,
          text: currentT.removedSuccess.replace("{email}", email),
          icon: "success",
          confirmButtonColor: "#10b981",

          customClass: {
            popup: "rounded-2xl",
          },
        });

        fetchSubscribers();
      } catch (error) {
        Swal.fire({
          title: currentT.errorTitle,
          text: currentT.failedRemove,
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
      title: currentT.exportedTitle,
      text: currentT.exportedSuccess,
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
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700 justify-center">
            <FaUsers className="text-primary" />
            <span>{currentT.loadingSubscribers}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {currentT.pleaseWait}
          </p>
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
                <FaUsers className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {currentT.subscriberManagement}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary" />
                  {currentT.manageSubscribers}
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-8 rounded-xl text-white font-bold"
              disabled={subscribers.length === 0}
            >
              <FaDownload className="text-lg" />
              {currentT.exportCsv}
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
              <p className="text-gray-600 font-semibold">{currentT.totalSubscribers}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-3xl text-success" />
                <span className="text-3xl font-bold text-gray-800">
                  {verifiedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.verified}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaTimesCircle className="text-3xl text-error" />
                <span className="text-3xl font-bold text-gray-800">
                  {unverifiedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.notVerified}</p>
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
                <FaEnvelope className="text-primary" />
                <span>
                  {filteredSubscribers.length}{" "}
                  {filteredSubscribers.length === 1
                    ? currentT.subscriberFound
                    : currentT.subscribersFound}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? currentT.noSubscribersFound : currentT.noSubscribersYet}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? currentT.searchAdjust : currentT.signNewsletter}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.emailAddress}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.status}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.subscribedOn}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.actions}
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
                              {currentT.verified}
                            </>
                          ) : (
                            <>
                              <FaTimesCircle />
                              {currentT.notVerified}
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          {new Date(subscriber.createdAt).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-US",
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
                          className="btn btn-error btn-sm flex items-center justify-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-white"
                        >
                          <FaTrash className="text-sm" />
                          {currentT.remove}
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
                  <p className="text-sm text-gray-600">{currentT.totalSubscribers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaUserCheck className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {verifiedCount} ({subscribers.length > 0 ? Math.round((verifiedCount / subscribers.length) * 100) : 0}%)
                  </p>
                  <p className="text-sm text-gray-600">{currentT.verifiedRate}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
