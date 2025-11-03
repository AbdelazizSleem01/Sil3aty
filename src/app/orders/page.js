"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Truck, Copy } from "lucide-react";

export default function OrdersPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `${t("name")} | ${t("yourOrderHistory")}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", t("viewOrderHistoryTrackOrders"));
    }
  }, [t]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/orders");
        setOrders(data);
      } catch (err) {
        setError(t("failedToFetchOrders"));
        toast.error(t("failedToFetchOrders"));
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchOrders();
  }, [session, t]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t("trackingNumberCopied"));
  };

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("pleaseSignIn")}</h1>
        <p className="text-gray-400 mb-4">{t("needToSignInToViewOrders")}</p>
        <Link href="/auth/signin" className="btn btn-primary">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("yourOrders")}</h1>
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner text-primary"></span>
          <p className=" mx-2 text-gray-700">{t("ordersLoading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("yourOrders")}</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("yourOrders")}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">{t("noOrdersFound")}</p>
          <Link href="/" className="btn btn-primary">
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                {/* Coupon Information */}
                {order.discountCode && (
                  <div className="mb-4 p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success">
                        {t("couponApplied")}
                      </div>
                      <span className="font-semibold">
                        {order.discountCode}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="text-success mt-1">
                        {t("discountAmount")}: $
                        {order.discountAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                {/* Order Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h2>
                  <span
                    className={`badge ${
                      order.status === "processing"
                        ? "badge-warning"
                        : order.status === "delivered"
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Tracking Information */}
                {order.tracking && (
                  <div className="mb-4 p-4 bg-base-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          {t("trackingInformation")}
                        </h3>
                      </div>
                      {order.tracking.status === "delivered" && (
                        <span className="badge badge-success">
                          {t("delivered")}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("trackingNumber")}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.tracking.number}</p>
                          <button
                            onClick={() =>
                              copyToClipboard(order.tracking.number)
                            }
                            className="btn btn-ghost btn-xs"
                            aria-label={t("copyTrackingNumber")}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">{t("carrier")}</p>
                        <p className="font-medium">{order.tracking.carrier}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">{t("status")}</p>
                        <p className="font-medium capitalize">
                          {order.tracking.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          {t("estimatedDelivery")}
                        </p>
                        <p className="font-medium">
                          {order.tracking.estimatedDelivery
                            ? new Date(
                                order.tracking.estimatedDelivery
                              ).toLocaleDateString()
                            : t("calculating")}
                        </p>
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-2">
                        {t("priceDetails")}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {t("subtotal")}:
                          </span>
                          <span>
                            $
                            {order.subTotal?.toFixed(2) ||
                              order.totalPrice.toFixed(2)}
                          </span>
                        </div>

                        {order.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-success">
                            <span>{t("discount")}:</span>
                            <span>-${order.discountAmount.toFixed(2)}</span>
                          </div>
                        )}

                        {order.shippingCost > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {t("shipping")}:
                            </span>
                            <span>${order.shippingCost.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between items-center font-bold text-primary">
                            <span>{t("finalTotal")}:</span>
                            <span>
                              $
                              {(order.finalTotal || order.totalPrice).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.tracking.url && (
                      <a
                        href={order.tracking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline mt-3"
                      >
                        {t("trackOnCarriersWebsite")}
                      </a>
                    )}
                  </div>
                )}

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("shippingAddress")}
                    </h3>
                    <p className="text-gray-400">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-gray-400">
                      {order.shippingAddress.email}
                    </p>
                    <p className="text-gray-400">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-gray-400">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.country}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-400">
                      {t("phone")}: {order.shippingAddress.phone}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("paymentDetails")}
                    </h3>
                    <p className="text-gray-400">
                      {t("method")}:{" "}
                      <span className="font-medium">{order.paymentMethod}</span>
                    </p>
                    <p className="text-gray-400">
                      {t("status")}:{" "}
                      {order.isPaid ? (
                        <span className="text-green-500">
                          {t("paidOn")}{" "}
                          {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-red-500">{t("notPaid")}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">{t("items")}</h3>
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            loading="lazy"
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            {item.size} / {item.color}
                          </p>
                          <p className="text-sm">
                            {item.qty} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("orderSummary")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("subtotal")}:</span>
                      <span>
                        $
                        {order.subTotal?.toFixed(2) ||
                          order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>{t("discount")}:</span>
                        <span>-${order.discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {order.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("shipping")}:</span>
                        <span>${order.shippingCost.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold pt-2 border-t mt-2">
                      <span>{t("total")}:</span>
                      <span className="text-primary">
                        ${(order.finalTotal || order.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">{t("total")}</p>
                    <p className="text-lg font-semibold">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
