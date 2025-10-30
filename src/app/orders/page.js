"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { Truck, Copy } from "lucide-react";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Sil3aty | Your Order History";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "View your order history, track your orders, and manage your returns."
      );
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/orders");
        setOrders(data);
      } catch (error) {
        setError("Failed to fetch orders. Please try again.");
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchOrders();
  }, [session]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Tracking number copied to clipboard");
  };

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-400 mb-4">
          You need to sign in to view your orders.
        </p>
        <Link href="/auth/signin" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Orders</h1>
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner text-primary"></span>
          <p className=" mx-2 text-gray-700">Orders Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Orders</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No orders found.</p>
          <Link href="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
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
                          Tracking Information
                        </h3>
                      </div>
                      {order.tracking.status === "delivered" && (
                        <span className="badge badge-success">Delivered</span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Tracking Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.tracking.number}</p>
                          <button
                            onClick={() =>
                              copyToClipboard(order.tracking.number)
                            }
                            className="btn btn-ghost btn-xs"
                            aria-label="Copy tracking number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Carrier</p>
                        <p className="font-medium">{order.tracking.carrier}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">
                          {order.tracking.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Estimated Delivery
                        </p>
                        <p className="font-medium">
                          {order.tracking.estimatedDelivery
                            ? new Date(
                                order.tracking.estimatedDelivery
                              ).toLocaleDateString()
                            : "Calculating..."}
                        </p>
                      </div>
                    </div>

                    {order.tracking.url && (
                      <a
                        href={order.tracking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline mt-3"
                      >
                        Track on carrier's website
                      </a>
                    )}
                  </div>
                )}

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Shipping Address
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
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Payment Details
                    </h3>
                    <p className="text-gray-400">
                      Method:{" "}
                      <span className="font-medium">{order.paymentMethod}</span>
                    </p>
                    <p className="text-gray-400">
                      Status:{" "}
                      {order.isPaid ? (
                        <span className="text-green-500">
                          Paid on {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-red-500">Not Paid</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Items</h3>
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
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total</p>
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
