"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";

export default function PaymentTrackPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentTrackingData = async () => {
      try {
        const { data } = await axios.get("/api/payment/track");
        // Debugging: Log the API response
        setOrders(data);
      } catch (error) {
        setError("Failed to fetch payment tracking data. Please try again.");
        toast.error("Failed to fetch payment tracking data");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchPaymentTrackingData();
  }, [session]);

  if (!session) {
    return <div>Please sign in to view your payment tracking.</div>;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Tracking</h1>
        <div className="text-center py-12">
          <p className="text-xl">Loading your payment tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Tracking</h1>
        <div className="text-center py-12">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Tracking</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No payment tracking data found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Order ID: {order._id}
              </h2>
              <p className="text-gray-600">
                Status: <span className="font-semibold">{order.status}</span>
              </p>
              <p className="text-gray-600">
                Total:{" "}
                <span className="font-semibold">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </p>
              <p className="text-gray-600">
                Date:{" "}
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </p>

              {/* Order Items */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center border-b pb-4"
                    >
                      <div className="relative w-16 h-16">
                        {item.product?.images?.[0] ? (
                          <img
                            loading="lazy"
                            src={item.product.images[0]}
                            alt={item.product.name || "Product image"}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="bg-gray-200 flex items-center justify-center h-full rounded-lg">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium">
                          {item.product?.name || "Unnamed Product"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.size} / {item.color}
                        </p>
                        <p className="text-sm">
                          {item.quantity} × $
                          {item.product?.price?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
