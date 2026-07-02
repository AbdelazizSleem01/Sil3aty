"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaUser,
  FaCalendar,
  FaComment,
  FaPaperPlane,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaExclamationCircle,
  FaSync,
  FaReply,
  FaEye,
  FaShieldAlt,
} from "react-icons/fa";

export default function AdminContactsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();

  const localT = {
    ar: {
      contactManagement: "إدارة جهات الاتصال",
      manageContacts: "إدارة الردود على استفسارات العملاء والرسائل الواردة",
      totalMessages: "إجمالي الرسائل",
      responded: "تم الرد عليها",
      pendingResponse: "في انتظار الرد",
      searchPlaceholder: "البحث في الرسائل بالاسم، البريد، الموضوع أو المحتوى...",
      messagesFound: "رسائل تم العثور عليها",
      messageFound: "رسالة تم العثور عليها",
      noMessagesFound: "لم يتم العثور على رسائل",
      noMessagesAvailable: "لا توجد رسائل تواصل حالياً",
      searchAdjust: "حاول تغيير كلمات البحث للعثور على ما تبحث عنه.",
      customersAppear: "ستظهر رسائل العملاء هنا بمجرد إرسالها من خلال نموذج التواصل.",
      replied: "تم الرد",
      pending: "قيد الانتظار",
      senderName: "الاسم",
      message: "الرسالة:",
      yourResponse: "ردك:",
      placeholderResponse: "اكتب ردك هنا...",
      sendResponse: "إرسال الرد",
      delete: "حذف",
      responseRate: "معدل الاستجابة",
      loadingContacts: "جاري تحميل الرسائل...",
      pleaseWait: "يرجى الانتظار...",
      accessDenied: "تم رفض الوصول",
      adminPrivileges: "مطلوب صلاحيات مدير النظام للوصول إلى هذه الصفحة",
      confirmDeleteTitle: "حذف الرسالة؟",
      confirmDeleteHtml: "أنت على وشك حذف رسالة من العميل:",
      confirmDeleteWarning: "لا يمكن التراجع عن هذا الإجراء!",
      yesDelete: "نعم، احذفها!",
      cancel: "إلغاء",
      toastResponseSent: "تم إرسال الرد للعميل بنجاح!",
      toastDeleteSuccess: "تم حذف رسالة التواصل بنجاح!",
      toastDeleteFailed: "فشل حذف الرسالة",
      toastLoadFailed: "فشل تحميل رسائل التواصل",
      toastEmptyResponse: "يرجى كتابة الرد قبل الإرسال",
    },
    en: {
      contactManagement: "Contact Management",
      manageContacts: "Manage and respond to customer inquiries",
      totalMessages: "Total Messages",
      responded: "Responded",
      pendingResponse: "Pending Response",
      searchPlaceholder: "Search messages by name, email, subject, or content...",
      messagesFound: "messages found",
      messageFound: "message found",
      noMessagesFound: "No messages found",
      noMessagesAvailable: "No contact messages yet",
      searchAdjust: "Try adjusting your search terms to find what you're looking for.",
      customersAppear: "Customer messages will appear here once they contact you through the contact form.",
      replied: "Replied",
      pending: "Pending",
      senderName: "Name",
      message: "Message:",
      yourResponse: "Your Response:",
      placeholderResponse: "Type your response here...",
      sendResponse: "Send Response",
      delete: "Delete",
      responseRate: "Response Rate",
      loadingContacts: "Loading Contacts...",
      pleaseWait: "Please wait while we fetch contact messages",
      accessDenied: "Access Denied",
      adminPrivileges: "Admin privileges required to access this page",
      confirmDeleteTitle: "Delete Message?",
      confirmDeleteHtml: "You are about to delete message from:",
      confirmDeleteWarning: "This action cannot be undone!",
      yesDelete: "Yes, Delete It!",
      cancel: "Cancel",
      toastResponseSent: "Response sent successfully!",
      toastDeleteSuccess: "Contact message deleted successfully!",
      toastDeleteFailed: "Failed to delete message",
      toastLoadFailed: "Failed to load contact messages",
      toastEmptyResponse: "Please write a response before sending",
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;
  const [contacts, setContacts] = useState([]);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = isRTL ? `التواصل | لوحة الأدمن` : `Contacts | Admin Dashboard`;
  }, [isRTL]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchContacts();
    }
  }, [status, session]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!res.ok) throw new Error(currentT.toastLoadFailed);
      const data = await res.json();
      setContacts(data);

      const initialResponses = {};
      data.forEach((contact) => {
        if (contact.response) {
          initialResponses[contact._id] = contact.response;
        }
      });
      setResponses(initialResponses);
    } catch (error) {
      toast.error(currentT.toastLoadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (id, contactName) => {
    if (!responses[id]?.trim()) {
      toast.error(currentT.toastEmptyResponse);
      return;
    }

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          response: responses[id],
        }),
      });

      if (!response.ok) throw new Error(isRTL ? "فشل إرسال الرد للعميل" : "Failed to update response");

      toast.success(currentT.toastResponseSent);

      setContacts(
        contacts.map((contact) =>
          contact._id === id ? { ...contact, response: responses[id] } : contact
        )
      );
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  const handleDelete = async (id, contactName) => {
    const result = await Swal.fire({
      title: currentT.confirmDeleteTitle,
      html: `
        <div class="text-center" dir="${isRTL ? "rtl" : "ltr"}">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${currentT.confirmDeleteHtml}</p>
          <p class="text-xl text-primary font-bold">${contactName}</p>
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
        const response = await fetch(`/api/contact/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) throw new Error(currentT.toastDeleteFailed);

        toast.success(currentT.toastDeleteSuccess);
        setContacts(contacts.filter((contact) => contact._id !== id));
      } catch (error) {
        toast.error(`❌ ${error.message}`);
      }
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!res.ok) throw new Error(currentT.toastLoadFailed);
      const data = await res.json();
      setContacts(data);
      toast.info(isRTL ? "تم تحديث القائمة بنجاح!" : "Contact list refreshed!");
    } catch (error) {
      toast.error(currentT.toastLoadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const respondedCount = contacts.filter((contact) => contact.response).length;
  const pendingCount = contacts.filter((contact) => !contact.response).length;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700 justify-center">
            <FaEnvelope className="text-primary" />
            <span>{currentT.loadingContacts}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {currentT.pleaseWait}
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaShieldAlt className="text-8xl text-error mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-error mb-4">{currentT.accessDenied}</h2>
          <p className="text-gray-600 text-lg">
            {currentT.adminPrivileges}
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
                <FaEnvelope className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {currentT.contactManagement}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  {currentT.manageContacts}
                </p>
              </div>
            </div>

            {/* Removed Refresh Button */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaEnvelope className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {contacts.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.totalMessages}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-3xl text-success" />
                <span className="text-3xl font-bold text-gray-800">
                  {respondedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.responded}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaExclamationCircle className="text-3xl text-warning" />
                <span className="text-3xl font-bold text-gray-800">
                  {pendingCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{currentT.pendingResponse}</p>
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
                  {filteredContacts.length}{" "}
                  {filteredContacts.length === 1 ? currentT.messageFound : currentT.messagesFound}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? currentT.noMessagesFound : currentT.noMessagesAvailable}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? currentT.searchAdjust : currentT.customersAppear}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300"
                >
                  <div className="card-body">
                    {/* Header with status and date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                          <span className="mx-1">•</span>
                          {new Date(contact.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className={`badge gap-2 ${
                          contact.response ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {contact.response ? (
                          <>
                            <FaCheckCircle className="text-xs" />
                            {currentT.replied}
                          </>
                        ) : (
                          <>
                            <FaExclamationCircle className="text-xs" />
                            {currentT.pending}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sender Information */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-primary" />
                        <span className="font-semibold text-gray-800">
                          {contact.name}
                        </span>
                      </div>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-max"
                      >
                        <FaEnvelope className="text-sm" />
                        <span className="text-sm">{contact.email}</span>
                      </a>
                    </div>

                    {/* Subject */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                        {contact.subject}
                      </h3>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaComment className="text-gray-400 text-sm" />
                        <span className="text-sm font-semibold text-gray-600">
                          {currentT.message}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {contact.message}
                      </p>
                    </div>

                    {/* Response Textarea */}
                    <div className="mb-4">
                      <label className="label flex items-center gap-2 mb-2">
                        <FaReply className="text-primary text-sm" />
                        <span className="label-text font-semibold">
                          {currentT.yourResponse}
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered textarea-primary w-full text-sm"
                        value={responses[contact._id] || contact.response || ""}
                        onChange={(e) =>
                          setResponses({
                            ...responses,
                            [contact._id]: e.target.value,
                          })
                        }
                        placeholder={currentT.placeholderResponse}
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleResponse(contact._id, contact.name)
                        }
                        className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 text-white font-bold"
                        disabled={
                          !responses[contact._id]?.trim() ||
                          responses[contact._id] === contact.response
                        }
                      >
                        <FaPaperPlane className="text-xs" />
                        {currentT.sendResponse}
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id, contact.name)}
                        className="btn btn-error btn-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 text-white"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredContacts.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaEnvelope className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {contacts.length}
                  </p>
                  <p className="text-sm text-gray-600">{currentT.totalMessages}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaCheckCircle className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {respondedCount} ({contacts.length > 0 ? Math.round((respondedCount / contacts.length) * 100) : 0}%)
                  </p>
                  <p className="text-sm text-gray-600">{currentT.responseRate}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
