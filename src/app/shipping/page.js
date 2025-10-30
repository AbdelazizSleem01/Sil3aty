"use client";
import {
  Truck,
  Clock,
  Globe,
  Package,
  CheckCircle,
  X,
  MapPin,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Shipping() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Sil3aty - Shipping Information";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Learn about our shipping options, delivery times, and policies at Sil3aty"
      );
    }
  }, []);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/track?number=${trackingNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to track order");
      }

      setTrackingResult(data);
    } catch (err) {
      setError(err.message);
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const shippingOptions = [
    {
      name: "Standard Shipping",
      price: "Free on orders over $50 ($4.99 otherwise)",
      delivery: "3-5 business days",
      icon: <Truck className="w-6 h-6 text-primary" />,
      features: [
        "Free on qualifying orders",
        "Package tracking included",
        "Signature not required",
      ],
    },
    {
      name: "Express Shipping",
      price: "$9.99",
      delivery: "1-2 business days",
      icon: <Clock className="w-6 h-6 text-secondary" />,
      features: [
        "Priority processing",
        "Real-time tracking",
        "Delivery notifications",
      ],
    },
    {
      name: "International Shipping",
      price: "From $14.99",
      delivery: "7-14 business days",
      icon: <Globe className="w-6 h-6 text-accent" />,
      features: [
        "Available to 50+ countries",
        "Customs forms handled",
        "Duties calculator available",
      ],
    },
  ];

  const restrictions = [
    {
      item: "Hazardous materials",
      allowed: false,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    {
      item: "Oversized items (over 50lbs)",
      allowed: false,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    {
      item: "Perishable goods",
      allowed: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      note: "Special packaging required",
    },
    {
      item: "Alcohol/tobacco",
      allowed: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      note: "Adult signature required",
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <Truck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-500 opacity-90 max-w-2xl mx-auto">
            Fast, reliable delivery options to get your order when you need it
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  {option.icon}
                  <h2 className="card-title text-2xl">{option.name}</h2>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 opacity-70" />
                    <span className="font-medium">{option.delivery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{option.price}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Details */}
        <div className="grid gap-12 md:grid-cols-2 mb-16">
          {/* Processing Times */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex text-gray-700 items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Order Processing
            </h2>
            <div className="prose text-gray-500">
              <p>
                Most orders are processed within <strong>1 business day</strong>{" "}
                of being placed. Orders placed after 2pm EST will be processed
                the next business day.
              </p>

              <div className="alert alert-info mt-4">
                <div>
                  <AlertTriangle className="w-5 h-5" />
                  <span>
                    During peak seasons, processing may take 2-3 business days.
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 text-primary">
                Same-Day Processing
              </h3>
              <p>
                For orders placed before 12pm EST, we offer same-day processing
                for an additional $5.99.
              </p>
            </div>
          </div>

          {/* Shipping Restrictions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex text-gray-700 items-center gap-2">
              <X className="w-6 h-6 text-red-500" />
              Shipping Restrictions
            </h2>
            <div className="space-y-4">
              {restrictions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-base-200 rounded-lg"
                >
                  {item.icon}
                  <div>
                    <p className="font-medium">{item.item}</p>
                    {item.note && (
                      <p className="text-sm opacity-75">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* International Shipping */}
        <div className="card bg-base-200 mb-16">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent" />
              International Shipping Details
            </h2>
            <div className="prose">
              <p>
                We ship to over 50 countries worldwide. International shipments
                may be subject to:
              </p>
              <ul>
                <li>Customs duties and taxes</li>
                <li>Import restrictions</li>
                <li>Additional processing time</li>
              </ul>
              <p>
                Use our{" "}
                <a href="#" className="link link-primary">
                  Duties Calculator
                </a>{" "}
                to estimate potential fees.
              </p>
            </div>
          </div>
        </div>

        {/* Track Your Order Section */}
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content mt-16">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Track Your Order
            </h2>
            <p className="text-sm opacity-90">
              Enter your order ID or tracking number to checkCheckCircle the
              status of your shipment
            </p>

            <form onSubmit={handleTrackOrder} className="space-y-4 mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter order ID or tracking number"
                  className="input input-bordered w-full text-base-content"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={loading || !trackingNumber.trim()}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Tracking...
                    </>
                  ) : (
                    "Track"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="alert alert-error mt-4">
                <div>
                  <X className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {trackingResult && (
              <div className="mt-6 bg-base-100 rounded-lg p-6 text-base-content">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      Order #{trackingResult.order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-sm opacity-75">
                      Placed on{" "}
                      {new Date(
                        trackingResult.order.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`badge ${getStatusBadgeClass(
                      trackingResult.tracking.status
                    )}`}
                  >
                    {trackingResult.tracking.status.replace("-", " ")}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <div>
                    <h4 className="font-bold mb-2">Shipping Information</h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Carrier:</span>{" "}
                        {trackingResult.tracking.carrier}
                      </p>
                      <p>
                        <span className="font-medium">Tracking #:</span>{" "}
                        {trackingResult.tracking.number}
                      </p>
                      {trackingResult.tracking.url && (
                        <a
                          href={trackingResult.tracking.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-accent"
                        >
                          Track on carrier's website
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Delivery Estimate</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {trackingResult.tracking.estimatedDelivery ? (
                        <span>
                          {new Date(
                            trackingResult.tracking.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Calculating...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold mb-4">Order Summary</h4>
                  <div className="space-y-4">
                    {trackingResult.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="avatar">
                          <div className="w-16 rounded">
                            <img
                              loading="lazy"
                              src={
                                item.product?.images?.[0] ||
                                "/placeholder-product.jpg"
                              }
                              alt={item.product?.name}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm">
                            {item.qty} × ${item.price.toFixed(2)}
                          </p>
                          {item.size && (
                            <p className="text-sm">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm">Color: {item.color}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-4">Shipping Progress</h4>
                  <ul className="steps steps-vertical">
                    {trackingResult.tracking.history.map((item, index) => (
                      <li
                        key={index}
                        className={`step ${
                          index <= trackingResult.tracking.history.length - 1
                            ? "step-primary"
                            : ""
                        }`}
                        data-content={
                          index === trackingResult.tracking.history.length - 1
                            ? "✓"
                            : ""
                        }
                      >
                        <div className="text-left">
                          <p className="font-medium capitalize">
                            {item.status}
                          </p>
                          <p className="text-sm opacity-75">
                            {new Date(item.date).toLocaleString()}
                          </p>
                          {item.location && (
                            <p className="text-sm opacity-75">
                              <MapPin className="inline w-3 h-3 mr-1" />
                              {item.location}
                            </p>
                          )}
                          {item.details && (
                            <p className="text-sm opacity-75 mt-1">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "delivered":
      return "badge-success";
    case "shipped":
    case "in-transit":
      return "badge-info";
    case "processing":
      return "badge-primary";
    case "exception":
      return "badge-error";
    default:
      return "badge-warning";
  }
}
