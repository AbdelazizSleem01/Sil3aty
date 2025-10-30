"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Mail,
  Send,
  Star,
  Sparkles,
  CheckCircle,
  Gift,
  Bell,
} from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      toast.success(data.message || "Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      toast.error(
        error.message || "Failed to subscribe. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-2xl mb-6 animate-pulse">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Stay Updated
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Join our newsletter and never miss out on exclusive offers, latest
            products, and exciting updates!
          </p>
        </div>

        {/* Main Subscription Card */}
        <div className="relative animate-fade-in delay-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-12 border border-white/20">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Exclusive Offers
                </h3>
                <p className="text-gray-600 text-sm">
                  Get access to special discounts and promotions
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Latest Products
                </h3>
                <p className="text-gray-600 text-sm">
                  Be the first to know about new arrivals
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Weekly Updates
                </h3>
                <p className="text-gray-600 text-sm">
                  Curated content delivered to your inbox
                </p>
              </div>
            </div>

            {/* Subscription Form */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Ready to Join?
              </h2>
              <p className="text-gray-600 mb-8">
                Enter your email address to start receiving our newsletter
              </p>

              <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
                <div className="relative mb-6">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full pl-14 pr-6 py-4 bg-white/90 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl text-gray-800 placeholder-gray-500 shadow-lg focus:shadow-xl transition-all duration-300 text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn bg-gradient-to-r from-emerald-500 to-green-600 border-0 px-12 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 group shadow-xl hover:shadow-2xl w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="loading loading-spinner mr-3"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-3 group-hover:animate-pulse text-white" />
                      <span className="font-bold text-lg text-white">
                        Subscribe Now
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No spam, unsubscribe anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100% free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in delay-1000">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <p className="text-gray-600">Happy Subscribers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <p className="text-gray-600">Products Featured</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              Weekly
            </div>
            <p className="text-gray-600">Newsletter Updates</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 animate-fade-in delay-1000">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-800">
                Sil3aty Newsletter
              </p>
              <p className="text-sm text-gray-600">
                Join thousands of happy subscribers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
