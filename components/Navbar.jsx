"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import axios from "axios";
import "../i18n";
import Image from "next/image";
import CartIcon from "./CartIcon";
import { toast } from "react-toastify";
import SignOutButton from "./SignOutButton";
import NotificationBell from "./NotificationBell";
import { useCart } from "./CartContext";
import {
  FiHome,
  FiInfo,
  FiFileText,
  FiPhone,
  FiFolder,
  FiLock,
  FiUser,
  FiBarChart2,
  FiPackage,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiGrid,
  FiAward,
  FiSearch,
} from "react-icons/fi";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const { cartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", profilePicture: "" });
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Initialize direction based on saved language
    const savedLang = localStorage.getItem('i18nextLng') || 'en';
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || "",
            email: data.email || "",
            profilePicture: data.profilePicture || "",
          });
        }
      } catch (error) {}
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (error) {}
    };

    fetchCategories();
  }, []);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  const openMobileMenu = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  if (status === "loading") {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-6 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-8 bg-emerald-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="md:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-500 ease-out  ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50 py-2"
            : "bg-white/90 backdrop-blur-sm shadow-lg py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? "h-11" : "h-12"
            }`}
          >
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/"
                className={`relative group flex items-center`}
              >
                <div className="relative  ">
                  <Image
                    src={"/images/logo2.png"}
                    width={isScrolled ? 65 : 65}
                    height={isScrolled ? 65 : 65}
                    className={`transition-all duration-300 group-hover:scale-105 filter drop-shadow-sm   ${isScrolled ? "h-10 w-12" : "w-17 h-14"}`}
                    alt="Sil3aty Logo"
                    priority
                  />
                </div>
                {!isScrolled && (
                  <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {t("name")}
                  </span>
                )}
              </Link>
            </div>
              <div className="hidden lg:flex items-center flex-1 max-w-5xl mx-6 justify-center">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="w-full btn btn-outline whitespace-nowrap px-4  border-primary text-primary hover:text-white p-3 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  title="Search"
                >
                  {t('searchForAnything')}
                  <FiSearch
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>

            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <NavLink href="/" icon={<FiHome size={18} />}>
                  {t('home')}
                </NavLink>
                <NavLink href="/about-us" icon={<FiInfo size={18} />}>
                  {t('about')}
                </NavLink>
                <NavLink href="/blogs" icon={<FiFileText size={18} />}>
                  {t('blogs')}
                </NavLink>
                <NavLink href="/contact" icon={<FiPhone size={18} />}>
                  {t('contact')}
                </NavLink>
              </div>

              <div className="dropdown text-gray-900 dropdown-hover dropdown-end ml-4">
                <label
                  tabIndex={0}
                  className="nav-link-enhanced group cursor-pointer"
                >
                  <FiGrid
                    size={18}
                    className="mr-2 group-hover:text-emerald-600 transition-colors text-primary"
                  />
                  <span className="hidden xl:inline">{t('categories')}</span>
                  <FiChevronDown
                    size={14}
                    className={`ml-2 group-hover:rotate-180 transition-transform duration-200 text-primary ${i18n.language === 'ar' ? 'rotate-90' : ''}`}
                  />
                </label>
                <ul
                  tabIndex={0}
                  className={`dropdown-content menu p-4 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl w-64 border border-gray-200/50 mt-3 ${i18n.language === 'ar' ? 'dropdown-start' : 'dropdown-end'}`}
                >
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-800 px-2 mb-2 flex items-center">
                      <FiFolder size={16} className="mr-2 text-emerald-600" />
                      {t('browseCategories')}
                    </h3>
                    <div className="max-h-48 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <li key={category._id}>
                            <Link
                              href={`/product?category=${category.slug}`}
                              className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-600 rounded-xl transition-all duration-200 group"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                              {category.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            {t('noCategoriesAvailable')}
                          </div>
                        </li>
                      )}
                    </div>
                  </div>
                </ul>
              </div>

              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                {session?.user?.isAdmin && (
                  <div className="relative text-gray-900">
                    <NotificationBell session={session} />
                  </div>
                )}

                <div className="dropdown dropdown-end ml-2">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-sm text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    {i18n.language === 'ar' ? 'العربية' : 'English'}
                    <FiChevronDown size={14} className="ml-1" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 mt-1"
                  >
                    <li>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={i18n.language === 'en' ? 'active' : ''}
                      >
                        English
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => changeLanguage('ar')}
                        className={i18n.language === 'ar' ? 'active' : ''}
                      >
                        العربية
                      </button>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/cart"
                  className="relative p-2.5 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 rounded-xl transition-all duration-300 group"
                >
                  <CartIcon />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </Link>

                {session ? (
                  <UserAuth user={user} session={session} />
                ) : (
                  <Link href="/login" className="btn-enhanced-login group">
                    <FiLock
                      size={16}
                      className="mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="hidden lg:inline">{t('login')}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={openMobileMenu}
                className="relative p-3 rounded-xl text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <FiMenu
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
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
      />

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}

function NavLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="nav-link-enhanced group relative text-gray-700 hover:text-emerald-600"
    >
      <span className="flex items-center space-x-2 px-1 py-2 rounded-xl transition-all duration-300">
        <span className="group-hover:scale-110 transition-transform duration-300 text-primary">
          {icon}
        </span>
        <span className="font-medium">{children}</span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </Link>
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
}) {
  return (
    <div
      className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
              <FiMenu className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Menu</h2>
              <p className="text-sm text-gray-600">Navigate easily</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => {
              setIsSearchModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-center btn btn-outline  border-primary text-primary hover:text-white p-3 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FiSearch
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">Search Products</span>
          </button>
        </div>

        {session && (
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {session.user.isAdmin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    <FiAward size={12} className="mr-1" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FiGrid size={14} className="mr-2" />
                Navigation
              </h3>
              <div className="space-y-1">
                <MobileNavLink
                  href="/"
                  icon={<FiHome size={20} />}
                  onClick={onClose}
                >
                  Home
                </MobileNavLink>
                <MobileNavLink
                  href="/about-us"
                  icon={<FiInfo size={20} />}
                  onClick={onClose}
                >
                  About Us
                </MobileNavLink>
                <MobileNavLink
                  href="/blogs"
                  icon={<FiFileText size={20} />}
                  onClick={onClose}
                >
                  Blogs
                </MobileNavLink>
                <MobileNavLink
                  href="/contact"
                  icon={<FiPhone size={20} />}
                  onClick={onClose}
                >
                  Contact
                </MobileNavLink>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FiFolder size={14} className="mr-2" />
                Categories
              </h3>
              <div className="space-y-1 pl-4 border-l-2 border-gray-100">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/product?category=${category.slug}`}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-600 rounded-xl transition-all duration-200 group"
                      onClick={onClose}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 italic">
                    No categories available
                  </div>
                )}
              </div>
            </div>

            {session && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <FiUser size={14} className="mr-2" />
                  Account
                </h3>
                <div className="space-y-1">
                  <MobileNavLink
                    href="/profile"
                    icon={<FiUser size={20} />}
                    onClick={onClose}
                  >
                    My Profile
                  </MobileNavLink>
                  <MobileNavLink
                    href="/orders"
                    icon={<FiPackage size={20} />}
                    onClick={onClose}
                  >
                    My Orders
                  </MobileNavLink>
                  {session.user.isAdmin && (
                    <MobileNavLink
                      href="/admin/dashboard"
                      icon={<FiBarChart2 size={20} />}
                      onClick={onClose}
                    >
                      Admin Dashboard
                    </MobileNavLink>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <Link
                  href="/cart"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
                  onClick={onClose}
                >
                  <div className="relative mr-3">
                    <FiShoppingCart
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                        {cartItemsCount > 99 ? "99+" : cartItemsCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">Shopping Cart</span>
                </Link>

                {!session ? (
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <FiLock
                      size={20}
                      className="mr-3 group-hover:scale-110 transition-transform"
                    />
                    <span className="font-medium">Login / Sign Up</span>
                  </Link>
                ) : (
                  <div className="px-4 py-3">
                    <SignOutButton mobile />
                  </div>
                )}
              </div>
            </div>
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
      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-600 rounded-xl transition-all duration-200 group"
      onClick={onClick}
    >
      <span className="mr-3 w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-emerald-100 transition-colors">
        {icon}
      </span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}

function UserAuth({ user, session }) {
  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle avatar transition-all duration-300 hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <div className="relative">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-emerald-500 transition-all duration-300 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </label>

      <ul
        tabIndex={0}
        className="dropdown-content menu p-4 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl w-64 border border-gray-200/50 mt-3"
      >
        <li className="mb-3">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {session.user.isAdmin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    <FiAward size={10} className="mr-1" />
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        </li>

        <li>
          <Link
            href="/profile"
            className="flex items-center px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-600 rounded-xl transition-all duration-200 group"
          >
            <FiUser
              size={16}
              className="mr-3 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">My Profile</span>
          </Link>
        </li>

        <li>
          <Link
            href="/orders"
            className="flex items-center px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
          >
            <FiPackage
              size={16}
              className="mr-3 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">My Orders</span>
          </Link>
        </li>

        {session?.user?.isAdmin && (
          <li>
            <Link
              href="/admin/dashboard"
              className="flex items-center px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
            >
              <FiBarChart2
                size={16}
                className="mr-3 group-hover:scale-110 transition-transform"
              />
              <span className="font-medium">Admin Dashboard</span>
            </Link>
          </li>
        )}

        <li className="border-t border-gray-200 mt-3 pt-3">
          <div className="px-4 py-2">
            <SignOutButton />
          </div>
        </li>
      </ul>
    </div>
  );
}

function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (productId) => {
    router.push(`/product/${productId}`);
    onClose();
  };

  const handleViewAll = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleViewAll();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, brands, categories..."
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                autoFocus
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiSearch size={20} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : query.trim() && results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.slice(0, 6).map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleResultClick(product._id)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0] || "/images/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {product.category?.name} • {product.brand?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${product.discountPrice || product.price}
                      </p>
                      {product.discountPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          ${product.price}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {results.length > 6 && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={handleViewAll}
                      className="w-full py-2 text-center text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View all {results.length} results →
                    </button>
                  </div>
                )}
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found for "{query}"
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Start typing to search...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const enhancedNavbarStyles = `
.nav-link-enhanced {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.nav-link-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
  transition: left 0.5s;
}

.nav-link-enhanced:hover::before {
  left: 100%;
}

.nav-link-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-enhanced-login {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-enhanced-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.dropdown-content {
  animation: fadeInScale 0.2s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.mobile-menu-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.mobile-menu-scroll::-webkit-scrollbar {
  width: 4px;
}

.mobile-menu-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-menu-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.mobile-menu-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.nav-link-enhanced:focus,
.btn-enhanced-login:focus,
button:focus {
  outline: 2px solid rgba(16, 185, 129, 0.5);
  outline-offset: 2px;
}
`;

if (typeof document !== "undefined") {
  const styleId = "enhanced-navbar-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = enhancedNavbarStyles;
    document.head.appendChild(styleElement);
  }
}
