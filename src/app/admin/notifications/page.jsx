"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  FaBell,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaSync,
  FaUser,
  FaComment,
  FaFilter,
  FaChartBar,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NotificationsTable() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();

  const localT = {
    ar: {
      notificationManagement: "إدارة الإشعارات",
      manageNotifications: "عرض وإدارة جميع إشعارات النظام",
      totalNotifications: "إجمالي الإشعارات",
      totalRecipients: "إجمالي المستلمين",
      notificationTypes: "أنواع الإشعارات",
      activeRate: "معدل النشاط",
      searchPlaceholder: "البحث عن إشعارات بالرسالة، النوع، أو المنشئ...",
      allTypes: "جميع الأنواع",
      notificationFound: "إشعار تم العثور عليه",
      notificationsFound: "إشعارات تم العثور عليها",
      noNotificationsFound: "لم يتم العثور على إشعارات",
      noNotificationsYet: "لا توجد إشعارات بعد",
      searchAdjust: "حاول تغيير كلمات البحث أو خيارات التصفية للعثور على ما تبحث عنه.",
      systemNotifications: "ستظهر إشعارات النظام هنا بمجرد إنشائها.",
      message: "الرسالة",
      type: "النوع",
      createdBy: "أنشئت بواسطة",
      recipients: "المستلمون",
      date: "التاريخ",
      actions: "الإجراءات",
      viewDetails: "عرض التفاصيل ←",
      system: "النظام",
      users: "مستخدمين",
      delete: "حذف",
      loadingNotifications: "جاري تحميل الإشعارات...",
      pleaseWait: "يرجى الانتظار بينما نقوم بجلب إشعاراتك...",
      confirmDeleteTitle: "حذف الإشعار؟",
      confirmDeleteHtml: "أنت على وشك حذف:",
      confirmDeleteWarning: "لا يمكن التراجع عن هذا الإجراء!",
      yesDelete: "نعم، قم بالحذف!",
      cancel: "إلغاء",
      deleteSuccess: "🗑️ تم حذف الإشعار بنجاح!",
      deleteFailed: "❌ فشل حذف الإشعار",
      refreshFailed: "❌ فشل تحديث الإشعارات",
      uniqueTypes: "الأنواع الفريدة"
    },
    en: {
      notificationManagement: "Notification Management",
      manageNotifications: "View and manage all system notifications",
      totalNotifications: "Total Notifications",
      totalRecipients: "Total Recipients",
      notificationTypes: "Notification Types",
      activeRate: "Active Rate",
      searchPlaceholder: "Search notifications by message, type, or creator...",
      allTypes: "All Types",
      notificationFound: "notification found",
      notificationsFound: "notifications found",
      noNotificationsFound: "No notifications found",
      noNotificationsYet: "No notifications yet",
      searchAdjust: "Try adjusting your search or filter terms to find what you're looking for.",
      systemNotifications: "System notifications will appear here once they are generated.",
      message: "Message",
      type: "Type",
      createdBy: "Created By",
      recipients: "Recipients",
      date: "Date",
      actions: "Actions",
      viewDetails: "View Details →",
      system: "System",
      users: "users",
      delete: "Delete",
      loadingNotifications: "Loading Notifications...",
      pleaseWait: "Please wait while we fetch your notifications",
      confirmDeleteTitle: "Delete Notification?",
      confirmDeleteHtml: "You are about to delete:",
      confirmDeleteWarning: "This action cannot be undone!",
      yesDelete: "Yes, Delete It!",
      cancel: "Cancel",
      deleteSuccess: "🗑️ Notification deleted successfully!",
      deleteFailed: "Failed to delete notification",
      refreshFailed: "Failed to refresh notifications",
      uniqueTypes: "Unique Types"
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    document.title = isRTL ? "الإشعارات | لوحة التحكم" : `Notifications | Admin Dashboard`;
  }, [isRTL]);

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
    fetchNotifications();
  }, [isRTL]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/api/admin/notifications");
      setNotifications(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id, message) => {
    const result = await Swal.fire({
      title: currentT.confirmDeleteTitle,
      html: `
        <div class="text-center" dir="${isRTL ? "rtl" : "ltr"}">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${currentT.confirmDeleteHtml}</p>
          <p class="text-xl text-primary font-bold line-clamp-2">${message}</p>
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
        await axios.delete(`/api/admin/notifications/${id}`);
        toast.success(currentT.deleteSuccess);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } catch (error) {
        toast.error(currentT.deleteFailed);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/notifications");
      setNotifications(data);
      toast.info(isRTL ? "تم تحديث الإشعارات!" : "Notifications refreshed!");
    } catch (error) {
      toast.error(currentT.refreshFailed);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.createdBy?.name &&
        notification.createdBy.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterType === "all" || notification.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const notificationTypes = [...new Set(notifications.map((n) => n.type))];
  const totalRecipients = notifications.reduce(
    (sum, n) => sum + (n.recipients?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700 justify-center">
            <FaBell className="text-primary" />
            <span>{currentT.loadingNotifications}</span>
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
                <FaBell className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {currentT.notificationManagement}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  {currentT.manageNotifications}
                </p>
              </div>
            </div>

            {/* Removed Refresh Button */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaBell className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {notifications.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.totalNotifications}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUsers className="text-3xl text-success" />
                <span className="text-3xl font-bold text-gray-800">
                  {totalRecipients}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.totalRecipients}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaComment className="text-3xl text-info" />
                <span className="text-3xl font-bold text-gray-800">
                  {notificationTypes.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.notificationTypes}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaChartBar className="text-3xl text-warning" />
                <span className="text-3xl font-bold text-gray-800">
                  {notifications.length > 0
                    ? Math.round(
                        (notifications.filter((n) => n.recipients?.length > 0)
                          .length /
                          notifications.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.activeRate}</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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

              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="select select-bordered select-lg rounded-xl"
                  >
                    <option value="all">{currentT.allTypes}</option>
                    {notificationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaBell className="text-primary" />
                  <span>
                    {filteredNotifications.length}{" "}
                    {filteredNotifications.length === 1
                      ? currentT.notificationFound
                      : currentT.notificationsFound}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== "all"
                  ? "No notifications found"
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter terms to find what you're looking for."
                  : "System notifications will appear here once they are generated."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.message}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.type}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.createdBy}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {currentT.recipients}
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
                  {filteredNotifications.map((notification, index) => (
                    <tr
                      key={notification._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3 max-w-md">
                          <FaComment className="text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-2 hover:line-clamp-none transition-all cursor-help leading-relaxed">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <p className="text-sm text-primary mt-1">
                                <a
                                  href={notification.link}
                                  className="hover:underline"
                                >
                                  {currentT.viewDetails}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="badge badge-lg capitalize font-bold">
                          {notification.type}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <span className="font-medium">
                            {notification.createdBy?.name || currentT.system}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-gray-400" />
                          <span className="font-bold text-gray-800">
                            {notification.recipients?.length || 0}
                          </span>
                          <span className="text-sm text-gray-500">{currentT.users}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleTimeString(isRTL ? "ar-EG" : "en-US")}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            deleteNotification(
                              notification._id,
                              notification.message
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

        {filteredNotifications.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaBell className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {notifications.length}
                  </p>
                  <p className="text-sm text-gray-600">{currentT.totalNotifications}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaUsers className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalRecipients}
                  </p>
                  <p className="text-sm text-gray-600">{currentT.totalRecipients}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <FaComment className="text-info text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {notificationTypes.length}
                  </p>
                  <p className="text-sm text-gray-600">{currentT.uniqueTypes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
