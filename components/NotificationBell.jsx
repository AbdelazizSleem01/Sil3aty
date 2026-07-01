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
  Star
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function NotificationBell({ session }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const isRTL = i18n.language === "ar";

  const { data: notificationsData, error: notificationsError, mutate: mutateNotifications } = useSWR(
    session?.user?.id ? "/api/admin/notifications" : null,
    {
      refreshInterval: 60000,
    }
  );

  const notifications = notificationsData
    ? [...notificationsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const unreadCount = notifications.filter(
    (n) => n.readBy && !n.readBy.includes(session.user.id)
  ).length;

  const loading = !notificationsData && !notificationsError;
  const error = notificationsError ? t("notifications.error.fetch") || "Failed to load notifications" : null;

  const markAsRead = async (id) => {
    try {
      await axios.post("/api/admin/notifications", { notificationId: id });
      if (notificationsData) {
        mutateNotifications(
          notificationsData.map((n) =>
            n._id === id
              ? { ...n, readBy: [...(n.readBy || []), session?.user?.id] }
              : n
          ),
          false
        );
      }
    } catch (error) {
      Swal.fire({
        title: t("common.error"),
        text: t("notifications.error.markRead") || "Failed to mark as read",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await axios.post("/api/admin/notifications/mark-all");
      if (notificationsData) {
        mutateNotifications(
          notificationsData.map((n) => ({
            ...n,
            readBy: [...(n.readBy || []), session?.user?.id],
          })),
          false
        );
      }
    } catch (error) {
      Swal.fire({
        title: t("common.error"),
        text: t("notifications.error.markAll") || "Failed to mark all as read",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return (
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingCart className="h-5 w-5" />
          </div>
        );
      case "product":
        return (
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart className="h-5 w-5" />
          </div>
        );
      case "contacts":
        return (
          <div className="p-2 bg-green-50 text-green-600 rounded-xl">
            <Mail className="h-5 w-5" />
          </div>
        );
      case "review":
        return (
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="h-5 w-5" />
          </div>
        );
      case "message":
        return (
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <MessageSquare className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-50 text-gray-500 rounded-xl">
            <User className="h-5 w-5" />
          </div>
        );
    }
  };

  const formatNotificationMessage = (msg) => {
    if (!msg) return "";
    
    // 1. Order Placed: "New order placed by {name}"
    if (msg.startsWith("New order placed by ")) {
      const name = msg.replace("New order placed by ", "");
      return t("notifications.orderPlaced", { name });
    }
    
    // 2. Product Created: "New product created by {name}"
    if (msg.startsWith("New product created by ")) {
      const name = msg.replace("New product created by ", "");
      return t("notifications.productCreated", { name });
    }
    
    // 3. Contact Message: "New contact message from {name}"
    if (msg.startsWith("New contact message from ")) {
      const name = msg.replace("New contact message from ", "");
      return t("notifications.contactMessage", { name });
    }
    
    // 4. Review Added: "تم إضافة مراجعة جديدة على منتج "{productName}" بواسطة {name}"
    const reviewRegex = /تم إضافة مراجعة جديدة على منتج "(.+?)" بواسطة (.+)/;
    const reviewMatch = msg.match(reviewRegex);
    if (reviewMatch) {
      const product = reviewMatch[1];
      const name = reviewMatch[2];
      return t("notifications.reviewAdded", { product, name });
    }

    return msg;
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-ghost btn-circle relative transition-all duration-200 ${isOpen ? "bg-base-200" : "hover:bg-base-200"}`}
        aria-label={t("notifications.label") || "Notifications"}
      >
        <BellIcon className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-error text-[10px] text-white font-bold items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-80 md:w-[400px] bg-base-100/95 backdrop-blur-md border border-base-300 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in`}
        >
          <div className="flex justify-between items-center px-4 py-3 border-b border-base-300 bg-base-50/50">
            <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <BellIcon className="h-4.5 w-4.5 text-primary" />
              {t("notifications.title") || "Notifications"}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="btn btn-xs btn-ghost text-xs text-primary hover:bg-primary/10 gap-1 rounded-lg"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckIcon className="h-3 w-3" />
                  )}
                  {t("notifications.markAll") || "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto divide-y divide-base-200">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-gray-500">{t("notifications.loading") || "Loading notifications..."}</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-error flex flex-col items-center gap-2">
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => mutateNotifications()}
                  className="btn btn-sm btn-outline btn-error rounded-xl"
                >
                  {t("common.retry") || "Retry"}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <div className="p-4 bg-base-100 rounded-full shadow-inner border border-base-200">
                  <BellIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-700">{t("notifications.empty.title") || "No notifications yet"}</p>
                <p className="text-xs text-gray-400 max-w-[200px]">{t("notifications.empty.subtitle") || "We will let you know when action is required"}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.readBy?.includes(session.user.id);
                return (
                  <Link
                    key={notification._id}
                    href={notification.link || "#"}
                    onClick={() => isUnread && markAsRead(notification._id)}
                    className={`flex gap-3 p-3.5 transition-all duration-200 hover:bg-base-200/50 ${
                      isUnread ? "bg-primary/5 hover:bg-primary/10" : "bg-base-100"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm text-gray-800 leading-normal ${isUnread ? "font-semibold" : "font-normal"}`}>
                          {formatNotificationMessage(notification.message)}
                        </p>
                        {isUnread && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 animate-pulse" title={t("notifications.new") || "New"} />
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-0.5">
                        <span>{new Date(notification.createdAt).toLocaleString(i18n.language, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}</span>
                        {notification.relatedUser?.name && (
                          <span className="font-medium text-gray-500 max-w-[120px] truncate">
                            {notification.relatedUser.name}
                          </span>
                        )}
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