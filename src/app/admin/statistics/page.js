"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  Ticket,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  Download,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StatisticsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/comprehensive-stats");

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      } else {
        toast.error(t("failedToFetchStats"));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error(t("errorLoadingStats"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchStats();
    }
  }, [session, t]);

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `statistics_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary w-16 h-16 mb-4" />
          <p className="mt-4 text-gray-600 text-lg">{t("loadingStats")}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            {t("failedToLoadStats")}
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary  ">
            {t("comprehensiveStatistics")}
          </h1>
          {lastUpdated && (
            <p className="text-gray-500 text-sm mt-1">
              {t("lastUpdated")}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            {t("refresh")}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* General Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            {t("generalStatistics")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title={t("totalUsers")}
              value={stats.generalStats.totalUsers}
              subtitle={`${stats.generalStats.totalAdmins} ${t("admins")}, ${
                stats.generalStats.totalRegularUsers
              } ${t("regularUsers")}`}
              color="bg-blue-100 text-blue-600"
              trend={12.5}
            />
            <StatCard
              icon={<Package className="w-8 h-8" />}
              title={t("totalProducts")}
              value={stats.generalStats.totalProducts}
              subtitle={`${stats.generalStats.totalCategories} ${t(
                "categories"
              )}, ${stats.generalStats.totalBrands} ${t("brands")}`}
              color="bg-green-100 text-green-600"
              trend={8.3}
            />
            <StatCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title={t("totalOrders")}
              value={stats.generalStats.totalOrders}
              subtitle={`${stats.generalStats.orderStatuses.successful} ${t(
                "successful"
              )}, ${stats.generalStats.orderStatuses.delivered} ${t(
                "delivered"
              )}`}
              color="bg-purple-100 text-purple-600"
              trend={15.2}
            />
            <StatCard
              icon={<MessageSquare className="w-8 h-8" />}
              title={t("totalContacts")}
              value={stats.generalStats.totalContacts}
              subtitle={`${stats.generalStats.totalFeedbacks} ${t(
                "feedbacks"
              )}, ${stats.generalStats.totalSubscribers} ${t("subscribers")}`}
              color="bg-orange-100 text-orange-600"
              trend={5.7}
            />
          </div>
        </div>

        {/* Sales & Revenue */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {t("salesRevenue")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("revenueOverview")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <span className="text-gray-600">{t("dailyRevenue")}</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${stats.salesRevenue.dailyRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <span className="text-gray-600">{t("monthlyRevenue")}</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ${stats.salesRevenue.monthlyRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <span className="text-gray-600">{t("yearlyRevenue")}</span>
                  <span className="font-bold text-purple-600 text-lg">
                    ${stats.salesRevenue.yearlyRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                  <span className="text-gray-600">{t("revenueGrowth")}</span>
                  <span
                    className={`font-bold text-lg ${
                      stats.salesRevenue.revenueGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.salesRevenue.revenueGrowth >= 0 ? (
                      <TrendingUp className="inline w-5 h-5 mx-1" />
                    ) : (
                      <TrendingDown className="inline w-5 h-5 mx-1" />
                    )}
                    {stats.salesRevenue.revenueGrowth >= 0 ? "+" : ""}
                    {stats.salesRevenue.revenueGrowth.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("revenueChart")}
              </h3>
              <div className="bg-gradient-to-b from-white to-gray-50 p-4 rounded-xl border border-gray-200">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.salesRevenue.revenueChartData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toFixed(2)}`,
                        t("revenue"),
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
            {t("orderStatusDistribution")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-white to-gray-50 p-4 rounded-xl border border-gray-200">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.salesRevenue.orderStatusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.salesRevenue.orderStatusChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("statusBreakdown")}
              </h3>
              {stats.salesRevenue.orderStatusChartData.map((item, index) => (
                <div
                  key={`status-${index}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-3 shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700 font-medium">
                      {t(item.name.toLowerCase())}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            {t("userInsights")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("averageOrderValue")}
              </h3>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                ${stats.userInsights.averageOrderValue.toFixed(2)}
              </div>
              <p className="text-gray-600">{t("averageValuePerOrder")}</p>
              <div className="mt-4 flex items-center text-green-600">
                <TrendingUp className="w-5 h-5 mx-1" />
                <span className="text-sm">+5.2% from last month</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("topActiveUsers")}
              </h3>
              <div className="space-y-3">
                {stats.userInsights.topActiveUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mr-4 shadow-sm">
                        <span className="text-sm font-bold text-indigo-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.user?.name || t("unknownUser")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.orderCount} {t("orders")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        ${user.totalSpent?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{t("totalSpent")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            {t("reviewsRatings")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-white to-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("ratingDistribution")}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.reviewsFeedback.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-100 flex flex-col justify-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("averageRating")}
              </h3>
              <div className="text-5xl font-bold text-yellow-500 mb-2">
                {stats.reviewsFeedback.averageRating.toFixed(1)}
                <span className="text-2xl text-gray-500">/5</span>
              </div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= Math.round(stats.reviewsFeedback.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                {t("basedOn")} {stats.generalStats.totalReviews} {t("reviews")}
              </p>
            </div>
          </div>
        </div>

        {/* Coupons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg mr-3">
              <Ticket className="w-6 h-6 text-pink-600" />
            </div>
            {t("coupons")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Ticket className="w-8 h-8" />}
              title={t("totalCoupons")}
              value={stats.coupons.totalCoupons}
              subtitle={`${stats.coupons.activeCoupons} ${t("active")}, ${
                stats.coupons.expiredCoupons
              } ${t("expired")}`}
              color="bg-pink-100 text-pink-600"
              trend={3.2}
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              title={t("totalUsage")}
              value={stats.coupons.totalUsage}
              subtitle={t("couponUsages")}
              color="bg-blue-100 text-blue-600"
              trend={18.7}
            />
            <StatCard
              icon={<DollarSign className="w-8 h-8" />}
              title={t("revenueGenerated")}
              value={`$${stats.coupons.totalRevenue.toFixed(2)}`}
              subtitle={t("fromCoupons")}
              color="bg-green-100 text-green-600"
              trend={22.4}
            />
            <StatCard
              icon={<BarChart3 className="w-8 h-8" />}
              title={t("avgDiscount")}
              value={
                stats.coupons.totalUsage > 0
                  ? `$${(
                      stats.coupons.totalRevenue / stats.coupons.totalUsage
                    ).toFixed(2)}`
                  : "$0.00"
              }
              subtitle={t("perUsage")}
              color="bg-purple-100 text-purple-600"
              trend={-2.1}
            />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-transform hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            {t("topSellingProducts")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-white to-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("salesChart")}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sold" ? value : `$${value.toFixed(2)}`,
                      name === "sold" ? t("unitsSold") : t("revenue"),
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="sold" radius={[4, 4, 0, 0]} fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {t("topProducts")}
              </h3>
              <div className="space-y-4">
                {stats.topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mr-4 shadow-sm">
                        <span className="text-sm font-bold text-emerald-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 truncate max-w-xs">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.sold} {t("unitsSold")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-lg">
                        ${product.revenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">{t("revenue")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-arabic {
          font-family: "Cairo", "Geeza Pro", sans-serif;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl p-3 ${color} shadow-sm`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 mx-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mx-1" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
