"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Tags,
  ListChecks,
  Factory,
  Mail,
  Star,
  MessageSquare,
  Bell,
  Ticket,
  BarChart3,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe,
  Home
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  if (status === "loading" || !session || !session.user.isAdmin) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary w-16 h-16" />
          <p className="mt-4 text-gray-600 font-medium">{t("common.loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      group: t("sidebar.navigation"),
      items: [
        { title: t("sidebar.dashboard"), href: "/admin/dashboard", icon: LayoutDashboard },
        { title: t("sidebar.statistics"), href: "/admin/statistics", icon: BarChart3 },
      ]
    },
    {
      group: t("sidebar.storeManagement"),
      items: [
        { title: t("sidebar.products"), href: "/admin/products", icon: Package },
        { title: t("sidebar.categories"), href: "/admin/categories", icon: Tags },
        { title: t("sidebar.brands"), href: "/admin/brands", icon: Factory },
      ]
    },
    {
      group: t("sidebar.sales"),
      items: [
        { title: t("sidebar.orders"), href: "/admin/orders", icon: ListChecks },
        { title: t("sidebar.coupons"), href: "/admin/coupons", icon: Ticket },
      ]
    },
    {
      group: t("sidebar.customersTeam"),
      items: [
        { title: t("sidebar.users"), href: "/admin/users", icon: Users },
        { title: t("sidebar.team"), href: "/admin/ourTeams", icon: UserCog },
      ]
    },
    {
      group: t("sidebar.communications"),
      items: [
        { title: t("sidebar.subscribers"), href: "/admin/subscribers", icon: Mail },
        { title: t("sidebar.reviews"), href: "/admin/reviews", icon: Star },
        { title: t("sidebar.contacts"), href: "/admin/contacts", icon: MessageSquare },
        { title: t("sidebar.feedback"), href: "/admin/feedback", icon: MessageSquare },
        { title: t("sidebar.notifications"), href: "/admin/notifications", icon: Bell },
      ]
    },
    {
      group: t("sidebar.pages"),
      items: [
        { title: t("sidebar.aboutUs"), href: "/admin/about-us", icon: Info },
      ]
    }
  ];

  // Helper to find the current active section title
  const getActiveTitle = () => {
    for (const group of menuItems) {
      for (const item of group.items) {
        if (pathname === item.href || pathname?.startsWith(item.href + "/")) {
          return item.title;
        }
      }
    }
    return t("adminDashboard") || "Dashboard";
  };

  const renderSidebarContent = (collapsedState) => (
    <div className="flex flex-col h-full bg-base-100">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-base-300">
        {!collapsedState ? (
          <>
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Image src="/images/logo2.png" width={32} height={32} className="w-8 h-8 object-contain" alt="Sil3aty Logo" />
              <span>{t("name") || "Sil3aty"}</span>
              <span className="badge badge-xs badge-secondary font-mono">ADMIN</span>
            </Link>
            <button
              onClick={() => setIsCollapsed(true)}
              className="btn btn-ghost btn-xs btn-circle hidden lg:flex text-gray-400 hover:text-primary"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-1">
            <Link href="/admin/dashboard" className="mx-auto">
              <Image src="/images/logo2.png" width={28} height={28} className="w-7 h-7 object-contain" alt="Logo" />
            </Link>
            <button
              onClick={() => setIsCollapsed(false)}
              className="btn btn-ghost btn-xs btn-circle hidden lg:flex text-gray-400 hover:text-primary"
            >
              {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin scrollbar-thumb-base-300">
        {menuItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsedState && (
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {group.group}
              </div>
            )}
            {group.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-white font-medium shadow-md shadow-primary/20"
                      : "text-gray-600 hover:bg-base-200 hover:text-gray-900"
                  } ${collapsedState ? "justify-center tooltip " + (isRTL ? "tooltip-left" : "tooltip-right") : ""}`}
                  data-tip={collapsedState ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsedState && <span className="text-sm truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-base-300 bg-base-50 flex items-center gap-3">
        <div className="avatar placeholder flex-shrink-0">
          <div className="bg-primary/20 text-primary rounded-xl w-10 h-10 flex items-center justify-center font-bold">
            {session.user.name?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
        {!collapsedState && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-800">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex min-h-screen bg-base-200">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-l border-base-300 h-[calc(100vh-72px)] sticky top-[72px] transition-all duration-300 z-30 ${isCollapsed ? "w-20" : "w-64"}`}>
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        >
          <aside 
            className={`fixed top-0 bottom-0 ${isRTL ? "right-0" : "left-0"} w-64 bg-base-100 z-50 flex flex-col shadow-2xl animate-fade-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden h-14 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 sticky top-[72px] z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-md font-bold text-gray-800 truncate">{getActiveTitle()}</h2>
          </div>
        </header>

        {/* Workspace views content */}
        <main className="flex-grow p-6 md:p-8 overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
