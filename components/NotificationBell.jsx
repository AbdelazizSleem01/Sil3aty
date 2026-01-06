"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BellIcon,
  CheckIcon,
  XIcon,
  Loader2,
  Mail,
  ShoppingCart,
  MessageSquare,
  User,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function NotificationBell({ session }) {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const isRTL = i18n.language === "ar";

  const fetchNotifications = async () => {
    try {
      if (!session?.user?.id) return;

      setLoading(true);
      const { data } = await axios.get("/api/admin/notifications");
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);

      const unread = sorted.filter(
        (n) => n.readBy && !n.readBy.includes(session.user.id)
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      setError(t("notifications.error.fetch"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [session, i18n.language]);

  const markAsRead = async (id) => {
    try {
      await axios.post("/api/admin/notifications", { notificationId: id });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, readBy: [...(n.readBy || []), session?.user?.id] }
            : n
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      Swal.fire({
        title: t("common.error"),
        text: t("notifications.error.markRead"),
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await axios.post("/api/admin/notifications/mark-all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: [...(n.readBy || []), session?.user?.id],
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      Swal.fire({
        title: t("common.error"),
        text: t("notifications.error.markAll"),
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-5 w-5 text-emerald-500" />;
      case "product":
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case "contacts":
        return <Mail className="h-5 w-5 text-green-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle relative hover:bg-base-200"
        aria-label={t("notifications.label")}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 badge badge-sm badge-error animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-80 md:w-96 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50`}
        >
          <div className="flex justify-between items-center p-3 border-b border-base-300 bg-base-200 rounded-t-lg">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-primary" />
              {t("notifications.title")}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="btn btn-xs btn-ghost text-xs flex items-center gap-1"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckIcon className="h-3 w-3" />
                  )}
                  {t("notifications.markAll")}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-xs btn-circle btn-error"
                aria-label={t("common.close")}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-gray-500">{t("notifications.loading")}</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-error">
                <p>{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="btn btn-sm btn-ghost mt-2"
                >
                  {t("common.retry")}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p>{t("notifications.empty.title")}</p>
                <p className="text-sm">{t("notifications.empty.subtitle")}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.readBy?.includes(session.user.id);
                return (
                  <Link
                    key={notification._id}
                    href={notification.link || "#"}
                    onClick={() => isUnread && markAsRead(notification._id)}
                    className={`block p-3 border-b border-base-200 transition-colors hover:bg-base-200 text-black ${
                      isUnread ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex justify-between items-start ${
                            isUnread ? "font-semibold" : ""
                          }`}
                        >
                          <p className="truncate">{notification.message}</p>
                          {isUnread && (
                            <span className="badge badge-xs badge-primary ml-2">
                              {t("notifications.new")}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString(i18n.language)}
                          </p>
                          {notification.relatedUser?.name && (
                            <p className="text-xs text-gray-500 truncate ml-2">
                              {notification.relatedUser.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}