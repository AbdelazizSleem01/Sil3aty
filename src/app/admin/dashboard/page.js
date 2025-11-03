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
} from "lucide-react";
import { IoInformation } from "react-icons/io5";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activity"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          toast.error("Failed to fetch dashboard stats");
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivity(activityData);
        } else {
          toast.error("Failed to fetch activity data");
        }
      } catch (error) {
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary w-16 h-16"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats.users}
            color="bg-emerald-100 text-emerald-600"
          />
          <DashboardCard
            icon={<Package className="w-6 h-6" />}
            title="Products"
            value={stats.products}
            color="bg-green-100 text-green-600"
          />
          <DashboardCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Total Orders"
            value={stats.orders}
            color="bg-green-100 text-green-600"
          />
          <DashboardCard
            icon={<Mail className="w-6 h-6" />}
            title="Messages"
            value={stats.messages}
            color="bg-amber-100 text-amber-600"
          />
        </div>
        {/* Summary Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Summary Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              icon={<DollarSign className="w-8 h-8" />}
              title="Total Revenue"
              value={`$${stats.revenue.toFixed(2)}`}
              description="Revenue from all orders"
              color="bg-green-100 text-green-700"
            />
            <SummaryCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Avg Order Value"
              value={`$${stats.averageOrderValue.toFixed(2)}`}
              description="Average value per order"
              color="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Completed Orders"
              value={stats.completedOrders}
              description="Successfully delivered orders"
              color="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title="Total Orders"
              value={stats.orders}
              description="All orders in the system"
              color="bg-green-100 text-green-700"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <DashboardButton
              icon={<Users className="w-5 h-5" />}
              title="Users"
              href="/admin/users"
            />
            <DashboardButton
              icon={<UserCog className="w-5 h-5" />}
              title="Team"
              href="/admin/ourTeams"
            />
            <DashboardButton
              icon={<Package className="w-5 h-5" />}
              title="Products"
              href="/admin/products"
            />
            <DashboardButton
              icon={<Tags className="w-5 h-5" />}
              title="Categories"
              href="/admin/categories"
            />
            <DashboardButton
              icon={<ListChecks className="w-5 h-5" />}
              title="Orders"
              href="/admin/orders"
            />
            <DashboardButton
              icon={<Factory className="w-5 h-5" />}
              title="Brands"
              href="/admin/brands"
            />
            <DashboardButton
              icon={<Mail className="w-5 h-5" />}
              title="Subscribers"
              href="/admin/subscribers"
            />
            <DashboardButton
              icon={<MessageCircle className="w-5 h-5" />}
              title="Reviews"
              href="/admin/reviews"
            />
            <DashboardButton
              icon={<MessageSquare className="w-5 h-5" />}
              title="Contacts"
              href="/admin/contacts"
            />
            <DashboardButton
              icon={<MessageSquare className="w-5 h-5" />}
              title="Feedback"
              href="/admin/feedback"
            />
            <DashboardButton
              icon={<Bell className="w-5 h-5" />}
              title="Notifications"
              href="/admin/notifications"
            />
            <DashboardButton
              icon={<Ticket className="w-5 h-5" />}
              title="Coupons"
              href="/admin/coupons"
            />
            <DashboardButton
              icon={<IoInformation className="w-5 h-5" />}
              title="About Us Sections"
              href="/admin/about-us"
            />
            <DashboardButton
              icon={<Users className="w-5 h-5" />}
              title="Users & Orders"
              href="/admin/user-orders"
            />
          </div>
        </div>
        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-500" />
              Recent Users
            </h2>
            <div className="space-y-4">
              {activity.users.length > 0 ? (
                activity.users.map((user) => (
                  <ActivityItem
                    key={user._id}
                    icon={<Users className="w-5 h-5 text-emerald-500" />}
                    title="New User Registered"
                    description={user.email}
                    time={new Date(user.createdAt).toLocaleDateString()}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent users
                </p>
              )}
            </div>
          </div>

          {/* Recent Orders & Messages */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
                Recent Orders
              </h2>
              <div className="space-y-4">
                {activity.orders.length > 0 ? (
                  activity.orders.map((order) => (
                    <ActivityItem
                      key={order._id}
                      icon={<ShoppingCart className="w-5 h-5 text-green-500" />}
                      title={`Order #${order._id.slice(-6)}`}
                      description={`${order.status} - $${
                        order.totalPrice?.toFixed(2) || "0.00"
                      }`}
                      time={new Date(order.createdAt).toLocaleDateString()}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent orders
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-amber-500" />
                Recent Messages
              </h2>
              <div className="space-y-4">
                {activity.messages.length > 0 ? (
                  activity.messages.map((msg) => (
                    <ActivityItem
                      key={msg._id}
                      icon={<Mail className="w-5 h-5 text-amber-500" />}
                      title={msg.subject}
                      description={`From: ${msg.name} (${msg.email})`}
                      time={new Date(msg.createdAt).toLocaleDateString()}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent messages
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Dashboard Card Component
function DashboardCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
      <div className={`rounded-full p-3 ${color} mr-4`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DashboardButton({ icon, title, href }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
        <div className="bg-gray-100 p-3 rounded-full mb-2 text-gray-500">
          {icon}
        </div>
        <span className="text-md text-primary font-bold text-center">
          {title}
        </span>
      </div>
    </Link>
  );
}

function SummaryCard({ icon, title, value, description, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col border border-gray-100">
      <div className="flex items-center mb-4">
        <div className={`rounded-lg p-3 ${color} mr-4`}>{icon}</div>
        <div>
          <p className="text-lg font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-auto">{description}</p>
    </div>
  );
}

// Reusable Activity Item Component
function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="mt-1 mr-3 flex-shrink-0">{icon}</div>
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
