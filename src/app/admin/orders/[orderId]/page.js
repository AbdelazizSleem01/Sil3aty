"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  TriangleAlert,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  User,
  MapPin,
  ShoppingCart,
  Calendar,
  DollarSign,
  Hash,
} from "lucide-react";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="skeleton w-8 h-8 rounded-full"></div>
          <div className="skeleton h-8 w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error shadow-lg">
          <TriangleAlert className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Order not found</h3>
            <div className="text-xs">
              The requested order could not be loaded
            </div>
          </div>
        </div>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      case "shipped":
        return "badge-info";
      case "processing":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500">Manage and view order information</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Order Date</div>
          <div className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-primary">
            <Hash className="w-6 h-6" />
          </div>
          <div className="stat-title">Order ID</div>
          <div className="stat-value text-sm font-mono truncate">
            {order._id}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-title">Amount Details</div>
          <div className="stat-value text-2xl text-primary">
            ${(order.finalTotal || order.totalPrice).toFixed(2)}
          </div>
          {order.discountCode && (
            <div className="stat-desc text-success">
              Coupon: {order.discountCode} (-$
              {order.discountAmount?.toFixed(2) || "0.00"})
            </div>
          )}
        </div>{" "}
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-secondary">
            {getStatusIcon(order.status)}
          </div>
          <div className="stat-title">Order Status</div>
          <div className="stat-value">
            <div
              className={`badge badge-lg ${getStatusColor(order.status)} gap-1`}
            >
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-secondary">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="stat-title">Payment Status</div>
          <div className="stat-value">
            <div
              className={`badge badge-lg ${
                order.isPaid ? "badge-success" : "badge-error"
              } gap-1`}
            >
              {order.isPaid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {order.isPaid ? "Paid" : "Unpaid"}
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {(order.discountAmount > 0 || order.shippingCost > 0) && (
        <div className="card bg-base-100 shadow-sm border border-primary/40">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>
                  ${order.subTotal?.toFixed(2) || order.totalPrice.toFixed(2)}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({order.discountCode}):</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>${order.shippingCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold pt-2 border-t border-primary/60 mt-2">
                <span>Final Total:</span>
                <span className="text-primary">
                  ${(order.finalTotal || order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="card bg-base-100 shadow-sm border border-primary/40">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="card-title text-lg">Customer Information</h2>
              </div>
              <div className="flex items-center gap-4 p-3 bg-base-200 rounded-xl">
                {order.user?.profilePicture && (
                  <div className="avatar">
                    <div className="w-12 rounded-full ring-2 ring-primary ring-offset-2">
                      <img
                        src={order.user.profilePicture}
                        alt={order.user.name}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {order.user?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{order.user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card bg-base-100 shadow-sm border border-primary/40">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="card-title text-lg">Shipping Address</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {order.shippingAddress?.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">City:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Postal Code:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.postalCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Country:</span>
                  <span className="font-medium">
                    {order.shippingAddress?.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm border border-primary/40">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="card-title text-lg">Order Items</h2>
                <div className="badge badge-primary badge-lg">
                  {order.orderItems.length} items
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="font-semibold">Product</th>
                      <th className="font-semibold">Details</th>
                      <th className="font-semibold text-right">Price</th>
                      <th className="font-semibold text-center">Qty</th>
                      <th className="font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-lg border border-primary/40">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="font-medium">{item.name}</div>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full border border-primary/40"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-xs">{item.color}</span>
                              </div>
                            )}
                            {item.size && (
                              <span className="badge badge-outline badge-sm">
                                {item.size}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right font-semibold">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <span className="font-semibold">{item.qty}</span>
                        </td>
                        <td className="text-right font-bold text-primary">
                          ${(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="border-t border-primary/40 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-primary">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
