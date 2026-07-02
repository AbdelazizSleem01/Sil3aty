"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../i18n";
import Image from "next/image";
import CartIcon from "./CartIcon";
import SignOutButton from "./SignOutButton";
import NotificationBell from "./NotificationBell";
import useSWR from "swr";
import { useCart } from "./CartContext";
import {
  FiHome,
  FiInfo,
  FiFileText,
  FiPhone,
  FiGrid,
  FiChevronDown,
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiPackage,
  FiBarChart2,
  FiShoppingCart,
  FiAward,
  FiLock,
} from "react-icons/fi";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const { cartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isRTL = i18n.language === "ar";

  const { data: categoriesData } = useSWR("/api/category");
  const { data: profileData } = useSWR(session?.user ? "/api/profile" : null);

  const categories = categoriesData || [];
  const user = {
    name: profileData?.name || "",
    email: profileData?.email || "",
    profilePicture: profileData?.profilePicture || "",
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("i18nextLng", lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMobileMenu = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  if (status === "loading") {
    return <NavbarSkeleton isScrolled={isScrolled} />;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg h-16 py-2"
            : "bg-white/90 backdrop-blur-sm shadow-md h-[4.5rem] py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group">
              <Image
                src="/images/logo2.png"
                width={isScrolled ? 48 : 52}
                height={isScrolled ? 48 : 52}
                className={`transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? "w-12 h-12" : "w-12 h-12"
                }`}
                alt="Sil3aty"
                priority
              />
              {!isScrolled && (
                <span
                  className="hidden sm:block text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                  suppressHydrationWarning={true}
                >
                  {t("name")}
                </span>
              )}
            </Link>

            {/* Search - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 transition-all group"
                suppressHydrationWarning={true}
              >
                <span suppressHydrationWarning={true}>
                  {t("searchForAnything")}
                </span>
                <FiSearch className="text-gray-400 group-hover:text-emerald-600" />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<FiHome size={16} />}>
                {t("home")}
              </NavLink>
              <NavLink href="/about-us" icon={<FiInfo size={16} />}>
                {t("about")}
              </NavLink>
              <NavLink href="/blogs" icon={<FiFileText size={16} />}>
                {t("blogs")}
              </NavLink>
              <NavLink href="/contact" icon={<FiPhone size={16} />}>
                {t("contact")}
              </NavLink>

              <div
                className={`dropdown dropdown-hover ${
                  isRTL ? "dropdown-start" : "dropdown-end"
                }`}
              >
                <label
                  tabIndex={0}
                  className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                >
                  <FiGrid size={16} />
                  <span className="hidden md:inline">{t("categories")}</span>
                  <FiChevronDown
                    size={12}
                    className={`transition-transform ${
                      isRTL ? "rotate-90" : ""
                    }`}
                  />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-3 shadow-xl bg-white rounded-xl w-60 mt-2 border border-gray-100"
                >
                  <li className="menu-title text-xs font-bold text-gray-600 px-2 mb-1">
                    {t("browseCategories")}
                  </li>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          href={`/product?category=${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                        >
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-xs text-gray-500 italic">
                      {t("noCategoriesAvailable")}
                    </li>
                  )}
                </ul>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                    i18n.language === "en"
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                    i18n.language === "ar"
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  العربية
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <div className="flex items-center gap-1 ml-1">
                {session?.user?.isAdmin && (
                  <NotificationBell session={session} />
                )}

                <Link
                  href="/cart"
                  className="relative p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <CartIcon />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </Link>

                {session ? (
                  <UserAuth user={user} session={session} t={t} isRTL={isRTL} />
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-md btn-primary mx-2 text-white"
                  >
                    <FiLock
                      size={16}
                      className="mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="hidden lg:inline">{t("login")}</span>
                  </Link>
                )}
              </div>
            </div>

            <button
              onClick={openMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all relative"
            >
              <FiMenu size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMobileMenu}
        setIsSearchModalOpen={setIsSearchModalOpen}
        user={user}
        session={session}
        categories={categories}
        cartItemsCount={cartItemsCount}
        isRTL={isRTL}
        t={t}
        i18n={i18n}
        changeLanguage={changeLanguage}
      />

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden w-full"
          onClick={closeMobileMenu}
        />
      )}

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        t={t}
      />
    </>
  );
}

function NavLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
}

function NavbarSkeleton({ isScrolled }) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm h-${
        isScrolled ? "12" : "14"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="hidden md:flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-16 h-6 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </nav>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  setIsSearchModalOpen,
  user,
  session,
  categories,
  cartItemsCount,
  isRTL,
  t,
  i18n,
  changeLanguage,
}) {
  return (
    <div
      className={`fixed inset-y-0 ${
        isRTL ? "left-0" : "right-0"
      } w-full bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen
          ? "translate-x-0"
          : isRTL
          ? "-translate-x-full"
          : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gradient-to-r from-emerald-50 to-green-50">
          <h2 className="font-bold text-gray-800">{t("menu")}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-3 border-b border-gray-3">
          <button
            onClick={() => {
              setIsSearchModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all"
          >
            <FiSearch size={18} />
            {t("searchForAnything")}
          </button>
        </div>

        {session && (
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="font-bold text-gray-900 truncate max-w-40">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate max-w-40">
                  {user.email}
                </p>
                {session.user.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiAward size={10} />
                    {t("admin")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t("navigation")}
            </h3>
            <div className="space-y-1">
              <MobileNavLink
                href="/"
                icon={<FiHome size={18} />}
                onClick={onClose}
              >
                {t("home")}
              </MobileNavLink>
              <MobileNavLink
                href="/about-us"
                icon={<FiInfo size={18} />}
                onClick={onClose}
              >
                {t("about")}
              </MobileNavLink>
              <MobileNavLink
                href="/blogs"
                icon={<FiFileText size={18} />}
                onClick={onClose}
              >
                {t("blogs")}
              </MobileNavLink>
              <MobileNavLink
                href="/contact"
                icon={<FiPhone size={18} />}
                onClick={onClose}
              >
                {t("contact")}
              </MobileNavLink>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t("categories")}
            </h3>
            <div className="space-y-1 pl-3 border-l border-gray-200">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/product?category=${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all"
                    onClick={onClose}
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    {cat.name}
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 italic">
                  {t("noCategoriesAvailable")}
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => changeLanguage("en")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                i18n.language === "en"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("ar")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                i18n.language === "ar"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              العربية
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          {session && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {t("account")}
              </h3>
              <div className="space-y-1">
                <MobileNavLink
                  href="/profile"
                  icon={<FiUser size={18} />}
                  onClick={onClose}
                >
                  {t("myProfile")}
                </MobileNavLink>
                <MobileNavLink
                  href="/orders"
                  icon={<FiPackage size={18} />}
                  onClick={onClose}
                >
                  {t("myOrders")}
                </MobileNavLink>
                {session.user.isAdmin && (
                  <MobileNavLink
                    href="/admin/dashboard"
                    icon={<FiBarChart2 size={18} />}
                    onClick={onClose}
                  >
                    {t("adminDashboard")}
                  </MobileNavLink>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <Link
              href="/cart"
              className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
              onClick={onClose}
            >
              <div className="flex items-center gap-2">
                <FiShoppingCart size={18} />
                <span className="font-medium">{t("shoppingCart")}</span>
              </div>
              {cartItemsCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </Link>

            {!session ? (
              <Link
                href="/login"
                className="btn btn-primary flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all"
                onClick={onClose}
              >
                <FiLock size={18} />
                <span className="font-medium">{t("login")}</span>
              </Link>
            ) : (
              <div className="px-3 py-2">
                <SignOutButton mobile />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavLink({ href, icon, children, onClick }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all"
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

function UserAuth({ user, session, isRTL, t }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 focus:outline-none group p-1 rounded-full hover:bg-emerald-50/60 transition-all duration-300"
      >
        <div className="relative">
          {user.profilePicture ? (
            <Image
              src={user.profilePicture}
              width={38}
              height={38}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/80 group-hover:border-emerald-600 transition-all shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-emerald-500/80 group-hover:border-emerald-600 transition-all shadow-sm">
              {user.name?.[0] || user.email?.[0] || "U"}
            </div>
          )}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
        </div>
        <FiChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown on outer click */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          
          <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-72 origin-top-right rounded-2xl bg-white/98 backdrop-blur-md border border-gray-100 shadow-2xl ring-1 ring-black/5 focus:outline-none z-40 transform transition-all duration-300 animate-scale-in p-2`}>
            {/* Header info */}
            <div className="p-3 mb-2 bg-gradient-to-br from-emerald-50/50 to-green-50/50 border border-emerald-100/30 rounded-xl flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover border border-emerald-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {session.user.isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                    <FiAward size={10} className="animate-bounce" />
                    {t("administrator") || "Admin"}
                  </span>
                )}
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all font-medium group"
              >
                <div className="p-1.5 bg-gray-50 group-hover:bg-emerald-100/50 rounded-lg text-gray-500 group-hover:text-emerald-600 transition-colors">
                  <FiUser className="w-4 h-4" />
                </div>
                {t("myProfile")}
              </Link>
              
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all font-medium group"
              >
                <div className="p-1.5 bg-gray-50 group-hover:bg-emerald-100/50 rounded-lg text-gray-500 group-hover:text-emerald-600 transition-colors">
                  <FiPackage className="w-4 h-4" />
                </div>
                {t("myOrders")}
              </Link>

              {session.user.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all font-medium group"
                >
                  <div className="p-1.5 bg-gray-50 group-hover:bg-emerald-100/50 rounded-lg text-gray-500 group-hover:text-emerald-600 transition-colors">
                    <FiBarChart2 className="w-4 h-4" />
                  </div>
                  {t("adminDashboard")}
                </Link>
              )}
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-all font-semibold text-sm group"
              >
                <span>{t("signOut")}</span>
                <FiLock className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SearchModal({ isOpen, onClose, t }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/search?query=${encodeURIComponent(q)}`
      );
      setResults(data.results || []);
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const goToProduct = (id) => {
    router.push(`/product/${id}`);
    onClose();
  };

  const goToSearch = () => {
    if (query.trim()) router.push(`/search?query=${encodeURIComponent(query)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {t("searchProducts")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToSearch()}
              placeholder={t("searchPlaceholder")}
              className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              autoFocus
            />
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : query && results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.slice(0, 6).map((p) => (
                <div
                  key={p._id}
                  onClick={() => goToProduct(p._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {p.category?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${p.discountPrice || p.price}
                    </p>
                    {p.discountPrice && (
                      <p className="text-xs text-gray-500 line-through">
                        ${p.price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {results.length > 6 && (
                <div className="p-3 text-center">
                  <button
                    onClick={goToSearch}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {t("viewAll")} {results.length} {t("results")}
                  </button>
                </div>
              )}
            </div>
          ) : query ? (
            <div className="text-center py-8 text-gray-500">
              {t("noResults")}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              {t("startTyping")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
