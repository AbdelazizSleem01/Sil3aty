"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = `Contacts | Admin Dashboard`;
  }, []);

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
      if (!res.ok) throw new Error("Failed to fetch contacts");
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
      toast.error("❌ Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (id, contactName) => {
    if (!responses[id]?.trim()) {
      toast.error("Please write a response before sending");
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

      if (!response.ok) throw new Error("Failed to update response");

      toast.success(`🎉 Response sent to ${contactName}!`);

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
      title: "Delete Message?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to delete message from:</p>
          <p class="text-xl text-primary font-bold">${contactName}</p>
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
        const response = await fetch(`/api/contact/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete contact");

        toast.success("🗑️ Contact message deleted successfully!");
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
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data);
      toast.info("Contact list refreshed!");
    } catch (error) {
      toast.error("❌ Failed to refresh contacts");
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
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaEnvelope className="text-primary" />
            <span>Loading Contacts...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch contact messages
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="text-8xl text-error mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-error mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">
            Admin privileges required to access this page
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
                <FaEnvelope className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Contact Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  Manage and respond to customer inquiries
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
              <p className="text-gray-600 font-semibold">Total Messages</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-3xl text-success" />
                <span className="text-3xl font-bold text-gray-800">
                  {respondedCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Responded</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaExclamationCircle className="text-3xl text-warning" />
                <span className="text-3xl font-bold text-gray-800">
                  {pendingCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Pending Response</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search messages by name, email, subject, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaEnvelope className="text-primary" />
                <span>
                  {filteredContacts.length}{" "}
                  {filteredContacts.length === 1 ? "message" : "messages"} found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No messages found" : "No contact messages yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Customer messages will appear here once they contact you through the contact form."}
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
                            Replied
                          </>
                        ) : (
                          <>
                            <FaExclamationCircle className="text-xs" />
                            Pending
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
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
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
                          Message:
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
                          Your Response:
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
                        placeholder="Type your response here..."
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleResponse(contact._id, contact.name)
                        }
                        className="btn btn-primary btn-sm flex-1 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                        disabled={
                          !responses[contact._id]?.trim() ||
                          responses[contact._id] === contact.response
                        }
                      >
                        <FaPaperPlane className="text-xs" />
                        Send Response
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id, contact.name)}
                        className="btn btn-error btn-sm flex items-center gap-2 transition-all duration-200 hover:scale-105"
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
                  <p className="text-sm text-gray-600">Total Messages</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaCheckCircle className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {respondedCount} (
                    {Math.round((respondedCount / contacts.length) * 100)}%)
                  </p>
                  <p className="text-sm text-gray-600">Response Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
