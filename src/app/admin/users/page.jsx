"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaUser,
  FaUserShield,
  FaEnvelope,
  FaSpinner,
  FaSearch,
  FaCrown,
  FaUserPlus,
  FaExclamationCircle,
  FaSync,
  FaTrash,
  FaKey,
  FaIdCard,
  FaImage,
} from "react-icons/fa";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Users() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/get-users");
        const data = await res.json();

        if (res.ok) {
          setUsers(data.users);
          toast.success("Users loaded successfully!");
        } else {
          toast.error(data.error);
        }
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, isAdmin, userName) => {
    const newRole = !isAdmin;
    const action = newRole ? "promote to Admin" : "demote to User";

    const confirmation = await Swal.fire({
      title: `Update User Role?`,
      html: `
        <div class="text-center">
          <div class="text-6xl ${newRole ? "text-warning" : "text-info"} mb-4">
            ${newRole ? "👑" : "👤"}
          </div>
          <p class="text-lg font-semibold mb-2">You are about to ${action}:</p>
          <p class="text-xl text-primary font-bold">${userName}</p>
          <p class="text-gray-600 mt-2">This will change their system permissions.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newRole ? "#f59e0b" : "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (confirmation.isConfirmed) {
      try {
        const res = await fetch("/api/admin/update-role", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, isAdmin: newRole }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(`🎉 ${data.message}`);
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, isAdmin: newRole } : user
            )
          );
        } else {
          toast.error(`❌ ${data.error}`);
        }
      } catch (error) {
        toast.error("❌ Failed to update user role");
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/get-users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        toast.info("Users list refreshed!");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to refresh users");
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (userId, userName) => {
    const confirmation = await Swal.fire({
      title: `Disable ${userName}?`,
      text: `Disabling will prevent this user from logging in. This action can be reversed by reactivating the account.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, disable",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const res = await fetch("/api/admin/soft-delete-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "User disabled");
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: "inactive" } : u))
        );
      } else {
        toast.error(data.error || "Failed to disable user");
      }
    } catch (error) {
      toast.error("Failed to disable user");
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const confirmation = await Swal.fire({
      title: `Reset password for ${userName}?`,
      html: `This will reset the user's password to <strong>123456789</strong>. They should change it after logging in.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password reset");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter((user) => user.isAdmin).length;
  const userCount = users.filter((user) => !user.isAdmin).length;

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Users...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch user data
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
                  User Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaIdCard className="text-primary" />
                  Manage user roles and system permissions
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUsers className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {users.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Users</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUserShield className="text-3xl text-warning" />
                <span className="text-3xl font-bold text-gray-800">
                  {adminCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Administrators</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUser className="text-3xl text-info" />
                <span className="text-3xl font-bold text-gray-800">
                  {userCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Regular Users</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaUsers className="text-primary" />
                <span>
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "user" : "users"} found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No users found" : "No users available"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Users will appear here once they register in the system."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      User
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div
                              className={`w-12 h-12 rounded-full ${
                                user.isAdmin
                                  ? "ring-2 ring-warning ring-offset-2"
                                  : ""
                              }`}
                            >
                              {user.profilePicture &&
                              user.profilePicture !==
                                "/images/default-avatar.png" ? (
                                <Image
                                  src={user.profilePicture}
                                  alt={user.name}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover w-full h-full"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div
                                  className={`w-full h-full rounded-full flex items-center justify-center ${
                                    user.isAdmin
                                      ? "bg-warning text-white"
                                      : "bg-neutral text-white"
                                  }`}
                                >
                                  {user.profilePicture &&
                                  user.profilePicture !==
                                    "/images/default-avatar.png" ? (
                                    <FaImage className="text-lg" />
                                  ) : (
                                    <span className="text-lg font-bold">
                                      {user.name?.charAt(0)?.toUpperCase() ||
                                        "U"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {user.isAdmin && (
                              <div className="absolute -top-1 -right-1">
                                <div className="bg-warning text-white rounded-full p-1">
                                  <FaUserShield className="text-xs" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {user.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              ID: {user._id?.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaEnvelope className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`badge badge-lg gap-2 ${
                            user.isAdmin
                              ? "badge-warning text-white"
                              : "badge-neutral text-white"
                          }`}
                        >
                          {user.isAdmin ? (
                            <>
                              <FaUserShield />
                              Administrator
                            </>
                          ) : (
                            <>
                              <FaUser />
                              User
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateRole(
                                user._id,
                                user.isAdmin,
                                user.name
                              )
                            }
                            className={`btn btn-sm flex items-center gap-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                              user.isAdmin ? "btn-neutral" : "btn-warning"
                            }`}
                          >
                            {user.isAdmin ? (
                              <>
                                <FaUser />
                                <span className="hidden sm:inline">
                                  Make User
                                </span>
                              </>
                            ) : (
                              <>
                                <FaCrown />
                                <span className="hidden sm:inline">
                                  Make Admin
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleResetPassword(user._id, user.name)
                            }
                            className="btn btn-sm btn-secondary flex items-center gap-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Reset password to 123456789"
                          >
                            <FaKey />
                            <span className="hidden sm:inline">Reset</span>
                          </button>

                          <button
                            onClick={() =>
                              handleSoftDelete(user._id, user.name)
                            }
                            className="btn btn-sm btn-error flex items-center gap-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Disable user (soft delete)"
                          >
                            <FaTrash />
                            <span className="hidden sm:inline">Disable</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaUsers className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <FaUserShield className="text-warning text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {adminCount} (
                    {Math.round((adminCount / users.length) * 100)}%)
                  </p>
                  <p className="text-sm text-gray-600">Admin Percentage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
