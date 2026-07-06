"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShoppingCart,
  LayoutGrid,
  Tags,
  Package,
  Bell,
  Mail,
  MessageSquare,
  ListChecks,
  Factory,
  UserCog,
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  MessageCircle,
  Ticket,
  BarChart3,
} from "lucide-react";
import { IoInformation } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { data: session, status } = useSession();
  const router = useRouter();

  const [compStats, setCompStats] = useState(null);

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    messages: 0,
    revenue: 0,
    subscriptions: 0,
    completedOrders: 0,
    averageOrderValue: 0,
  });
  const [activity, setActivity] = useState({
    users: [],
    orders: [],
    messages: [],
  });
  const [loading, setLoading] = useState(true);

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
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes, compRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activity"),
          fetch("/api/admin/comprehensive-stats"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        else toast.error(t("failedToFetchStats"));

        if (activityRes.ok) setActivity(await activityRes.json());
        else toast.error(t("failedToFetchActivity"));

        if (compRes.ok) setCompStats(await compRes.json());
      } catch {
        toast.error(t("errorLoadingDashboard"));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary w-16 h-16" />
          <p className="mt-4 text-gray-600">{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-gray-50 p-6 ${isRTL ? "font-arabic" : ""}`}
    >
    

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {t("adminDashboard")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={<Users className="w-6 h-6" />}
            title={t("totalUsers")}
            value={stats.users}
            color="bg-emerald-100 text-emerald-600"
          />
          <DashboardCard
            icon={<Package className="w-6 h-6" />}
            title={t("products")}
            value={stats.products}
            color="bg-green-100 text-green-600"
          />
          <DashboardCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title={t("totalOrders")}
            value={stats.orders}
            color="bg-green-100 text-green-600"
          />
          <DashboardCard
            icon={<Mail className="w-6 h-6" />}
            title={t("messages")}
            value={stats.messages}
            color="bg-amber-100 text-amber-600"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {t("summaryStatistics")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              icon={<DollarSign className="w-8 h-8" />}
              title={t("totalRevenue")}
              value={`$${stats.revenue.toFixed(2)}`}
              description={t("revenueFromAllOrders")}
              color="bg-green-100 text-green-700"
            />
            <SummaryCard
              icon={<TrendingUp className="w-8 h-8" />}
              title={t("avgOrderValue")}
              value={`$${stats.averageOrderValue.toFixed(2)}`}
              description={t("averageValuePerOrder")}
              color="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              icon={<CheckCircle className="w-8 h-8" />}
              title={t("completedOrders")}
              value={stats.completedOrders}
              description={t("successfullyDeliveredOrders")}
              color="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title={t("totalOrders")}
              value={stats.orders}
              description={t("allOrdersInSystem")}
              color="bg-green-100 text-green-700"
            />
          </div>
        </div>

        {compStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart 1: Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col h-[380px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {t("orderStatusDistribution") || "Order Status Distribution"}
              </h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compStats.salesRevenue?.orderStatusChartData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(compStats.salesRevenue?.orderStatusChartData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, t("orders")]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col h-[380px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {t("topSellingProducts") || "Top Selling Products"}
              </h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(compStats.topProducts || []).slice(0, 5)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, t("revenue")]} />
                    <Legend />
                    <Bar dataKey="revenue" name={t("revenue")} fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {t("quickActions")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <DashboardButton
              icon={<Users className="w-5 h-5" />}
              title={t("users")}
              href="/admin/users"
            />
            <DashboardButton
              icon={<UserCog className="w-5 h-5" />}
              title={t("team")}
              href="/admin/ourTeams"
            />
            <DashboardButton
              icon={<Package className="w-5 h-5" />}
              title={t("products")}
              href="/admin/products"
            />
            <DashboardButton
              icon={<Tags className="w-5 h-5" />}
              title={t("categories")}
              href="/admin/categories"
            />
            <DashboardButton
              icon={<ListChecks className="w-5 h-5" />}
              title={t("orders")}
              href="/admin/orders"
            />
            <DashboardButton
              icon={<Factory className="w-5 h-5" />}
              title={t("brands")}
              href="/admin/brands"
            />
            <DashboardButton
              icon={<Mail className="w-5 h-5" />}
              title={t("subscribers")}
              href="/admin/subscribers"
            />
            <DashboardButton
              icon={<MessageCircle className="w-5 h-5" />}
              title={t("reviews")}
              href="/admin/reviews"
            />
            <DashboardButton
              icon={<MessageSquare className="w-5 h-5" />}
              title={t("contacts")}
              href="/admin/contacts"
            />
            <DashboardButton
              icon={<MessageSquare className="w-5 h-5" />}
              title={t("feedback")}
              href="/admin/feedback"
            />
            <DashboardButton
              icon={<Bell className="w-5 h-5" />}
              title={t("notifications.title")}
              href="/admin/notifications"
            />
            <DashboardButton
              icon={<Ticket className="w-5 h-5" />}
              title={t("coupons")}
              href="/admin/coupons"
            />
            <DashboardButton
              icon={<BarChart3 className="w-5 h-5" />}
              title={t("comprehensiveStatistics")}
              href="/admin/statistics"
            />
            <DashboardButton
              icon={<IoInformation className="w-5 h-5" />}
              title={t("aboutUsSections")}
              href="/admin/about-us"
            />
            <DashboardButton
              icon={<Users className="w-5 h-5" />}
              title={t("usersAndOrders")}
              href="/admin/user-orders"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <Users className="w-5 h-5 mx-2 text-emerald-500" />
              {t("recentUsers")}
            </h2>
            <div className="space-y-4">
              {activity.users.length ? (
                activity.users.map((user) => (
                  <ActivityItem
                    key={user._id}
                    icon={<Users className="w-5 h-5 text-emerald-500" />}
                    title={t("newUserRegistered")}
                    description={user.email}
                    time={new Date(user.createdAt).toLocaleDateString(
                      i18n.language
                    )}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {t("noRecentUsers")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 mx-2 text-green-500" />
                {t("recentOrders")}
              </h2>
              <div className="space-y-4">
                {activity.orders.length ? (
                  activity.orders.map((order) => (
                    <ActivityItem
                      key={order._id}
                      icon={<ShoppingCart className="w-5 h-5 text-green-500" />}
                      title={`${t("order")} #${order._id.slice(-6)}`}
                      description={`${order.status} - $${
                        order.totalPrice?.toFixed(2) ?? "0.00"
                      }`}
                      time={new Date(order.createdAt).toLocaleDateString(
                        i18n.language
                      )}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {t("noOrderRecent")}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <Mail className="w-5 h-5 mx-2 text-amber-500" />
                {t("recentMessages")}
              </h2>
              <div className="space-y-4">
                {activity.messages.length ? (
                  activity.messages.map((msg) => (
                    <ActivityItem
                      key={msg._id}
                      icon={<Mail className="w-5 h-5 text-amber-500" />}
                      title={msg.subject}
                      description={`${t("from")}: ${msg.name} (${msg.email})`}
                      time={new Date(msg.createdAt).toLocaleDateString(
                        i18n.language
                      )}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {t("noMessageRecent")}
                  </p>
                )}
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

function DashboardCard({ icon, title, value, color }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
      <div className={`rounded-full p-3 ${color} mx-4`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DashboardButton({ icon, title, href }) {
  const { t } = useTranslation();
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
        <div className="bg-gray-100 p-3 rounded-full mb-2 text-gray-500">
          {icon}
        </div>
        <span className="text-md text-primary font-bold text-center ">
          {title}
        </span>
      </div>
    </Link>
  );
}

function SummaryCard({ icon, title, value, description, color }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col border border-gray-100">
      <div className="flex items-center mb-4">
        <div className={`rounded-lg p-3 ${color} mx-4`}>{icon}</div>
        <div>
          <p className="text-lg font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-auto">{description}</p>
    </div>
  );
}

function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="mt-1 mx-3 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-600 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
        {time}
      </span>
    </div>
  );
}
