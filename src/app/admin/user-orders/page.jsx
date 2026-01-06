"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaShoppingCart,
  FaSearch,
  FaEye,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaDollarSign,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFilter,
  FaDownload,
  FaUser,
  FaSync,
  FaExclamationCircle,
  FaStar,
  FaTruck,
  FaCreditCard,
  FaChartBar,
  FaEnvelope,
} from "react-icons/fa";

export default function AdminUserOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 👇 الحالة الجديدة للتحكم في الـ fetch
  const [usersWithOrders, setUsersWithOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    user: null,
  });
  const [hasFetched, setHasFetched] = useState(false); // 🚀 منع الـ refetch

  // 👇 تحسين الـ useEffect للـ Authentication فقط
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
  }, [status, session, router]);

  // 👇 fetch مع التحقق من hasFetched
  const fetchUsersWithOrders = useCallback(
    async (forceRefresh = false) => {
      // 🚀 منع الـ fetch إذا تم بالفعل ولا يوجد forceRefresh
      if (!forceRefresh && hasFetched) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/admin/users-with-orders");
        if (!response.ok) throw new Error("Failed to fetch users with orders");

        const data = await response.json();
        setUsersWithOrders(data.users);
        setHasFetched(true);
      } catch (error) {
        toast.error(`❌ ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [hasFetched]
  );

  // 👇 useEffect يعمل مرة واحدة فقط عند تحميل الصفحة الأولى
  useEffect(() => {
    if (session?.user?.isAdmin && !hasFetched) {
      fetchUsersWithOrders();
    }
  }, [session, hasFetched, fetchUsersWithOrders]);

  // 👇 Refresh يعمل Force Refresh
  const handleRefresh = async () => {
    toast.info("🔄 Refreshing data...");
    await fetchUsersWithOrders(true); // 🚀 forceRefresh = true
  };

  // باقي الكود بدون تغيير...
  const filteredUsers = useMemo(() => {
    return usersWithOrders.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        user.orders.some(
          (order) =>
            order._id?.toLowerCase().includes(searchLower) ||
            order.orderItems.some((item) =>
              item.name?.toLowerCase().includes(searchLower)
            )
        )
      );
    });
  }, [usersWithOrders, searchTerm]);

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "badge-success";
      case "shipped":
        return "badge-info";
      case "processing":
        return "badge-warning";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="w-3 h-3" />;
      case "shipped":
        return <FaTruck className="w-3 h-3" />;
      case "processing":
        return <FaSpinner className="w-3 h-3" />;
      case "cancelled":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaBox className="w-3 h-3" />;
    }
  };

  // باقي الـ JSX نفس الشيء بدون تغيير...
  if (loading && !hasFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Users & Orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header مع تحسين الـ Refresh Button */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaUsers className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Users & Orders Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  Manage customers, view orders, and details
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 rounded-xl"
                title="Force Refresh Data"
              >
                <FaSync
                  className={`text-lg ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {/* باقي المكونات نفس الشيء... */}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUsers className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {usersWithOrders.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Customers</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaShoppingCart className="text-3xl text-green-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {usersWithOrders.reduce(
                    (sum, user) => sum + user.orders.length,
                    0
                  )}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Orders</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaDollarSign className="text-3xl text-green-500" />
                <span className="text-3xl font-bold text-gray-800">
                  $
                  {usersWithOrders
                    .reduce(
                      (sum, user) =>
                        sum +
                        user.orders.reduce(
                          (orderSum, order) => orderSum + order.totalPrice,
                          0
                        ),
                      0
                    )
                    .toFixed(0)}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Revenue</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or order details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaUsers className="text-primary" />
                  <span>{filteredUsers.length} customers found</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Users and Orders List */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm
                  ? "No customers found"
                  : "No customers with orders yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Customers with orders will appear here once they place their first order."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      #
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Orders
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Total Spent
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Last Order
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, userIndex) => (
                    <tr
                      key={user._id}
                      className={`border-b border-base-300 hover:bg-base-200/50 transition-colors ${
                        userIndex % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-600">
                        {userIndex + 1}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center">
                              <span className="text-lg font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ID: {user._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaPhone className="text-gray-400" />
                              <span className="text-gray-700">
                                {user.phone}
                              </span>
                            </div>
                          )}
                          {user.shippingAddress && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaMapMarkerAlt className="text-gray-400" />
                              <span className="text-gray-700 truncate max-w-[150px]">
                                {user.shippingAddress.city},{" "}
                                {user.shippingAddress.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaShoppingCart className="text-green-500" />
                            <span className="font-semibold text-gray-800">
                              {user.orders.length}{" "}
                              {user.orders.length === 1 ? "order" : "orders"}
                            </span>
                          </div>
                          {user.orders.slice(0, 2).map((order, index) => (
                            <div
                              key={order._id}
                              className="text-xs bg-gray-100 rounded px-2 py-1"
                            >
                              <div className="flex items-center gap-1">
                                <span>#{order._id?.slice(-6)}</span>
                                <div
                                  className={`badge badge-xs gap-1 ${getOrderStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getOrderStatusIcon(order.status)}
                                  {order.status}
                                </div>
                              </div>
                            </div>
                          ))}
                          {user.orders.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{user.orders.length - 2} more orders
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-lg text-green-600">
                          ${user.totalSpent?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Avg: $
                          {user.averageOrderValue
                            ? (
                                user.averageOrderValue / user.orders.length
                              ).toFixed(2)
                            : "0.00"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {user.lastOrderDate ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <FaCalendar className="text-gray-400" />
                              {new Date(
                                user.lastOrderDate
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                user.lastOrderDate
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No orders</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setDetailsModal({ isOpen: true, user })
                            }
                            className="btn btn-primary btn-sm flex items-center gap-2"
                            title="View Details"
                          >
                            <FaEye />
                            View Details
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

        {/* Comprehensive Details Modal */}
        {detailsModal.isOpen && detailsModal.user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
              <div className="p-6 border-b border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-xl">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Customer Details - {detailsModal.user.name}
                      </h3>
                      <p className="text-gray-600">
                        Complete profile and order history
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setDetailsModal({ isOpen: false, user: null })
                    }
                    className="btn btn-ghost btn-circle btn-lg hover:bg-red-50 hover:text-red-600"
                  >
                    <FaTimesCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Customer Information Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaUser className="mr-2 text-emerald-600" />
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {detailsModal.user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {detailsModal.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Customer ID: {detailsModal.user._id?.slice(-8)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <FaEnvelope className="text-emerald-500" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Email Address
                            </p>
                            <p className="font-medium">
                              {detailsModal.user.email}
                            </p>
                          </div>
                        </div>

                        {detailsModal.user.phone && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <FaPhone className="text-green-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Phone Number
                              </p>
                              <p className="font-medium">
                                {detailsModal.user.phone}
                              </p>
                            </div>
                          </div>
                        )}

                        {detailsModal.user.shippingAddress && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <FaMapMarkerAlt className="text-red-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Shipping Address
                              </p>
                              <p className="font-medium">
                                {detailsModal.user.shippingAddress.address},{" "}
                                {detailsModal.user.shippingAddress.city}
                              </p>
                              <p className="text-sm text-gray-600">
                                {detailsModal.user.shippingAddress.country}{" "}
                                {detailsModal.user.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Statistics */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaChartBar className="mr-2 text-green-600" />
                      Account Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {detailsModal.user.orders.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Orders
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          ${detailsModal.user.totalSpent?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          $
                          {detailsModal.user.averageOrderValue?.toFixed(2) ||
                            "0.00"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg Order Value
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {detailsModal.user.lastOrderDate
                            ? new Date(
                                detailsModal.user.lastOrderDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">Last Order</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders History Section */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                      <FaShoppingCart className="mr-2 text-green-600" />
                      Order History ({detailsModal.user.orders.length} orders)
                    </h4>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {detailsModal.user.orders.length === 0 ? (
                      <div className="text-center py-12">
                        <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          No Orders Found
                        </h3>
                        <p className="text-gray-500">
                          This customer hasn't placed any orders yet.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {detailsModal.user.orders.map((order, index) => (
                          <div
                            key={order._id}
                            className="p-6 hover:bg-gray-50 transition-colors"
                          >
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                  #{order._id?.slice(-4)}
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-800">
                                    Order #{order._id?.slice(-8)}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  ${order.totalPrice?.toFixed(2)}
                                </div>
                                <div
                                  className={`badge gap-1 ${getOrderStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getOrderStatusIcon(order.status)}
                                  {order.status}
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <h6 className="font-semibold text-gray-800 mb-3">
                                Order Items:
                              </h6>
                              <div className="space-y-2">
                                {order.orderItems.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="flex items-center gap-3 p-2 bg-white rounded-lg"
                                  >
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <FaBox className="text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {item.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Quantity: {item.qty} × $
                                        {item.price?.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-gray-800">
                                        ${(item.price * item.qty)?.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Details */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FaCreditCard className="text-emerald-500" />
                                  <span className="text-sm">
                                    <strong>Payment Status:</strong>
                                    <span
                                      className={`ml-2 badge badge-sm ${
                                        order.isPaid
                                          ? "badge-success"
                                          : "badge-error"
                                      }`}
                                    >
                                      {order.isPaid ? "Paid" : "Pending"}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaTruck className="text-green-500" />
                                  <span className="text-sm">
                                    <strong>Shipping:</strong>{" "}
                                    {order.shippingAddress?.address || "N/A"}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="text-red-500" />
                                  <span className="text-sm">
                                    <strong>City:</strong>{" "}
                                    {order.shippingAddress?.city || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaPhone className="text-green-500" />
                                  <span className="text-sm">
                                    <strong>Phone:</strong>{" "}
                                    {order.shippingAddress?.phone || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setDetailsModal({ isOpen: false, user: null })
                    }
                    className="btn btn-ghost"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
