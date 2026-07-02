"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const localT = {
    ar: {
      orderDetails: "تفاصيل الطلب",
      manageViewOrder: "إدارة وعرض معلومات الطلب",
      orderDate: "تاريخ الطلب",
      orderId: "معرف الطلب",
      amountDetails: "تفاصيل المبلغ",
      coupon: "الكوبون",
      orderStatus: "حالة الطلب",
      paymentStatus: "حالة الدفع",
      priceBreakdown: "تفصيل السعر",
      subtotal: "المجموع الفرعي:",
      discount: "الخصم ({code}):",
      shipping: "الشحن:",
      finalTotal: "الإجمالي النهائي:",
      customerInfo: "معلومات العميل",
      shippingAddress: "عنوان الشحن",
      name: "الاسم:",
      email: "البريد الإلكتروني:",
      phone: "الهاتف:",
      address: "العنوان:",
      city: "المدينة:",
      postalCode: "الرمز البريدي:",
      country: "البلد:",
      product: "المنتج",
      details: "التفاصيل",
      price: "السعر",
      qty: "الكمية",
      total: "الإجمالي",
      totalAmount: "المبلغ الإجمالي:",
      items: "منتجات",
      item: "منتج",
      loadingOrder: "جاري تحميل تفاصيل الطلب...",
      pleaseWait: "يرجى الانتظار...",
      orderNotFound: "الطلب غير موجود",
      loadFailed: "تعذر تحميل الطلب المطلوب",
      paid: "مدفوع",
      unpaid: "غير مدفوع",
      processing: "جاري التجهيز",
      shipped: "تم الشحن",
      inTransit: "قيد النقل",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
      fetchFailed: "فشل تحميل تفاصيل الطلب"
    },
    en: {
      orderDetails: "Order Details",
      manageViewOrder: "Manage and view order information",
      orderDate: "Order Date",
      orderId: "Order ID",
      amountDetails: "Amount Details",
      coupon: "Coupon",
      orderStatus: "Order Status",
      paymentStatus: "Payment Status",
      priceBreakdown: "Price Breakdown",
      subtotal: "Subtotal:",
      discount: "Discount ({code}):",
      shipping: "Shipping:",
      finalTotal: "Final Total:",
      customerInfo: "Customer Information",
      shippingAddress: "Shipping Address",
      name: "Name:",
      email: "Email:",
      phone: "Phone:",
      address: "Address:",
      city: "City:",
      postalCode: "Postal Code:",
      country: "Country:",
      product: "Product",
      details: "Details",
      price: "Price",
      qty: "Qty",
      total: "Total",
      totalAmount: "Total Amount:",
      items: "items",
      item: "item",
      loadingOrder: "Loading Order Details...",
      pleaseWait: "Please wait while we fetch your order",
      orderNotFound: "Order not found",
      loadFailed: "The requested order could not be loaded",
      paid: "Paid",
      unpaid: "Unpaid",
      processing: "Processing",
      shipped: "Shipped",
      inTransit: "In-Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
      fetchFailed: "Failed to fetch order"
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) throw new Error(currentT.fetchFailed);
        const data = await response.json();
        setOrder(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (orderId && currentT) fetchOrder();
  }, [orderId, currentT]);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6" dir={isRTL ? "rtl" : "ltr"}>
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
      <div className="max-w-6xl mx-auto p-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="alert alert-error shadow-lg">
          <TriangleAlert className="w-6 h-6" />
          <div>
            <h3 className="font-bold">{currentT.orderNotFound}</h3>
            <div className="text-xs">
              {currentT.loadFailed}
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

  const translateStatus = (status) => {
    switch (status) {
      case "processing":
        return currentT.processing;
      case "shipped":
        return currentT.shipped;
      case "in-transit":
        return currentT.inTransit;
      case "delivered":
        return currentT.delivered;
      case "cancelled":
        return currentT.cancelled;
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentT.orderDetails}</h1>
            <p className="text-gray-500">{currentT.manageViewOrder}</p>
          </div>
        </div>
        <div className={`${isRTL ? "sm:text-left" : "sm:text-right"}`}>
          <div className="text-sm text-gray-500">{currentT.orderDate}</div>
          <div className="font-semibold flex items-center gap-2 justify-end">
            <Calendar className="w-4 h-4" />
            {new Date(order.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-US")}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-primary">
            <Hash className="w-6 h-6" />
          </div>
          <div className="stat-title">{currentT.orderId}</div>
          <div className="stat-value text-sm font-mono truncate">
            {order._id}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-title">{currentT.amountDetails}</div>
          <div className="stat-value text-2xl text-primary font-bold">
            ${(order.finalTotal || order.totalPrice).toFixed(2)}
          </div>
          {order.discountCode && (
            <div className="stat-desc text-success font-semibold">
              {currentT.coupon}: {order.discountCode} (-$
              {order.discountAmount?.toFixed(2) || "0.00"})
            </div>
          )}
        </div>{" "}
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-secondary">
            {getStatusIcon(order.status)}
          </div>
          <div className="stat-title">{currentT.orderStatus}</div>
          <div className="stat-value">
            <div
              className={`badge badge-lg ${getStatusColor(order.status)} gap-1 font-bold text-white`}
            >
              {getStatusIcon(order.status)}
              {translateStatus(order.status)}
            </div>
          </div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-primary/40">
          <div className="stat-figure text-secondary">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="stat-title">{currentT.paymentStatus}</div>
          <div className="stat-value">
            <div
              className={`badge badge-lg ${
                order.isPaid ? "badge-success" : "badge-error"
              } gap-1 text-white font-bold`}
            >
              {order.isPaid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {order.isPaid ? currentT.paid : currentT.unpaid}
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {(order.discountAmount > 0 || order.shippingCost > 0) && (
        <div className="card bg-base-100 shadow-sm border border-primary/40">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">{currentT.priceBreakdown}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{currentT.subtotal}</span>
                <span className="font-semibold">
                  ${order.subTotal?.toFixed(2) || order.totalPrice.toFixed(2)}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>{currentT.discount.replace("{code}", order.discountCode)}</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{currentT.shipping}</span>
                  <span className="font-semibold">${order.shippingCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold pt-2 border-t border-primary/60 mt-2">
                <span>{currentT.finalTotal}</span>
                <span className="text-primary text-lg">
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
                <h2 className="card-title text-lg">{currentT.customerInfo}</h2>
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
                <h2 className="card-title text-lg">{currentT.shippingAddress}</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.name}</span>
                  <span className="font-medium">
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.email}</span>
                  <span className="font-medium">
                    {order.shippingAddress?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.phone}</span>
                  <span className="font-medium">
                    {order.shippingAddress?.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.address}</span>
                  <span className={`font-medium ${isRTL ? "text-left" : "text-right"} max-w-[60%]`}>
                    {order.shippingAddress?.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.city}</span>
                  <span className="font-medium">
                    {order.shippingAddress?.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.postalCode}</span>
                  <span className="font-medium">
                    {order.shippingAddress?.postalCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{currentT.country}</span>
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
                <h2 className="card-title text-lg">{currentT.product}</h2>
                <div className="badge badge-primary badge-lg">
                  {order.orderItems.length} {order.orderItems.length === 1 ? currentT.item : currentT.items}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th className={`font-semibold ${isRTL ? "text-right" : "text-left"}`}>{currentT.product}</th>
                      <th className={`font-semibold ${isRTL ? "text-right" : "text-left"}`}>{currentT.details}</th>
                      <th className={`font-semibold ${isRTL ? "text-left" : "text-right"}`}>{currentT.price}</th>
                      <th className="font-semibold text-center">{currentT.qty}</th>
                      <th className={`font-semibold ${isRTL ? "text-left" : "text-right"}`}>{currentT.total}</th>
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
                        <td className={`${isRTL ? "text-left" : "text-right"} font-semibold`}>
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <span className="font-semibold">{item.qty}</span>
                        </td>
                        <td className={`${isRTL ? "text-left" : "text-right"} font-bold text-primary`}>
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
                  <span>{currentT.totalAmount}</span>
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
