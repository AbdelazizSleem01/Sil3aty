"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FaPenFancy,
  FaUser,
  FaCalendarAlt,
  FaTags,
  FaArrowRight,
  FaPlus,
  FaSearch,
  FaClock,
  FaEye,
  FaShare,
  FaBookOpen,
  FaComments,
  FaRocket,
  FaLightbulb,
  FaFire,
  FaTrendingUp,
  FaBookReader,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import {
  HiOutlineSparkles,
  HiBookOpen,
  HiUserGroup,
  HiCalendar,
  HiTag,
  HiFire,
  HiTrendingUp,
  HiEye,
  HiClock,
} from "react-icons/hi";
import {
  RiUser3Line,
  RiBookOpenLine,
  RiFireLine,
  RiTrendingUpLine,
  RiEyeLine,
  RiTimeLine,
} from "react-icons/ri";
import {
  BiTrendingUp,
  BiUser,
  BiCategory,
  BiStats,
  BiSearch,
  BiPlus,
  BiTime,
} from "react-icons/bi";
import { TbClock, TbEye } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { MdSort, MdDateRange, MdPerson, MdTrendingUp } from "react-icons/md";

export default function BlogsPage() {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    monthlyViews: 0,
  });

  // Advanced filtering states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [minViews, setMinViews] = useState("");
  const [minLikes, setMinLikes] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blog");
        if (!response.ok) {
          throw new Error(t("failedToFetchBlogs"));
        }
        const data = await response.json();
        setBlogs(data);
        calculateStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [t]);

  const calculateStats = (blogsData) => {
    const totalViews = blogsData.reduce(
      (sum, blog) => sum + (blog.views || 0),
      0
    );
    const totalLikes = blogsData.reduce(
      (sum, blog) => sum + (blog.likesCount || 0),
      0
    );
    const totalComments = blogsData.reduce(
      (sum, blog) => sum + (blog.commentsCount || 0),
      0
    );
    const monthlyViews = Math.round(totalViews * 0.3);

    setStats({ totalViews, totalLikes, totalComments, monthlyViews });
  };

  const allTags = ["all", ...new Set(blogs.flatMap((blog) => blog.tags))];
  const allAuthors = [
    "all",
    ...new Set(blogs.map((blog) => blog.author?.name).filter(Boolean)),
  ];

  // Helper functions for filtering
  const matchesSearch = (blog) => {
    if (!searchTerm) return true;
    return (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      blog.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const matchesTag = (blog) => {
    if (selectedTag === "all") return true;
    return blog.tags.includes(selectedTag);
  };

  const matchesAdvancedTags = (blog) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every((tag) => blog.tags.includes(tag));
  };

  const matchesAuthor = (blog) => {
    if (selectedAuthor === "all") return true;
    return blog.author?.name === selectedAuthor;
  };

  const matchesDateRange = (blog) => {
    if (dateRange === "all") return true;
    const blogDate = new Date(blog.createdAt);
    const now = new Date();

    switch (dateRange) {
      case "today":
        return blogDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return blogDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return blogDate >= monthAgo;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return blogDate >= yearAgo;
      default:
        return true;
    }
  };

  const matchesPopularity = (blog) => {
    const viewsMatch = !minViews || (blog.views || 0) >= parseInt(minViews);
    const likesMatch =
      !minLikes || (blog.likesCount || 0) >= parseInt(minLikes);
    return viewsMatch && likesMatch;
  };

  // Sorting function
  const sortBlogs = (blogsToSort) => {
    return [...blogsToSort].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "most-viewed":
          return (b.views || 0) - (a.views || 0);
        case "most-liked":
          return (b.likesCount || 0) - (a.likesCount || 0);
        case "most-commented":
          return (b.commentsCount || 0) - (a.commentsCount || 0);
        default:
          return 0;
      }
    });
  };

  // Apply all filters
  const filteredBlogs = sortBlogs(
    blogs.filter(
      (blog) =>
        matchesSearch(blog) &&
        matchesTag(blog) &&
        matchesAdvancedTags(blog) &&
        matchesAuthor(blog) &&
        matchesDateRange(blog) &&
        matchesPopularity(blog)
    )
  );

  // Clear all advanced filters
  const clearAdvancedFilters = () => {
    setSortBy("newest");
    setSelectedAuthor("all");
    setDateRange("all");
    setMinViews("");
    setMinLikes("");
    setSelectedTags([]);
  };

  // Toggle tag selection for advanced filters
  const toggleTagSelection = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <HiOutlineSparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            {t("loadingBlogs")}
          </h2>
          <p className="text-gray-600">{t("latest")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center px-4">
        <div className="card bg-white/80 backdrop-blur-lg shadow-2xl w-full max-w-md border-0">
          <div className="card-body text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-rose-100 to-emerald-100 rounded-2xl shadow-lg">
                <FaComments className="w-16 h-16 text-rose-500" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-rose-600 mb-2">
              {t("error")}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="card-actions justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaRocket className="w-4 h-4" />
                {t("retry")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-emerald-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/20">
              <RiBookOpenLine className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-10">
            {t("blogTitle")}
          </h1>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div
                className={`absolute inset-y-0 ${
                  isRTL ? "left-0 pl-4" : "right-0 pr-4"
                } flex items-center pointer-events-none`}
              >
                <BiSearch className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("searchBlogs")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`input input-bordered w-full ${
                  isRTL ? "pr-4 pl-12" : "pr-12 pl-4"
                } py-4 text-gray-800 bg-white/95 backdrop-blur-lg border-white/20 focus:border-white/40 rounded-2xl text-lg`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-20">
        {/* Statistics Section */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TbEye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stats.totalViews}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("totalViews") || "إجمالي المشاهدات"}
              </p>
            </div>

            <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <RiFireLine className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stats.totalLikes}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("blogLiked") || "إجمالي الإعجابات"}
              </p>
            </div>

            <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaComments className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stats.totalComments}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("blogComments") || "إجمالي التعليقات"}
              </p>
            </div>

            <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaBookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {blogs.length}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("totalBlogs") || "إجمالي المقالات"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
              <HiOutlineSparkles className="text-yellow-500 w-8 h-8" />
              {t("latestArticles")}
              <span className="badge badge-primary badge-lg text-white shadow-lg">
                {filteredBlogs.length}{" "}
                {filteredBlogs.length === 1 ? t("article") : t("articles")}
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              {t("exploreDiverseCollection")}
            </p>
          </div>

          {session && (
            <Link
              href="/blogs/create"
              className="btn btn-primary gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl px-6 py-3 text-lg font-medium"
            >
              <BiPlus className="w-5 h-5" />
              {t("createNewArticle")}
            </Link>
          )}
        </div>

        {/* Tags Filter */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2 text-gray-600 font-medium mb-3 px-2">
            <HiTag className="w-5 h-5 text-emerald-500" />
            {t("categories")}:
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent p-3 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex-shrink-0 btn gap-2 capitalize transition-all duration-300 rounded-xl ${
                  selectedTag === tag
                    ? "btn-primary shadow-lg"
                    : "btn-ghost bg-white/80 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200/50"
                }`}
              >
                <RiUser3Line className="w-4 h-4" />
                {tag === "all" ? t("all") : tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn btn-outline btn-primary gap-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
          >
            <FiFilter className="w-5 h-5" />
            {t("advancedFilters") || "مرشحات متقدمة"}
            {showAdvancedFilters ? (
              <FiChevronUp className="w-4 h-4" />
            ) : (
              <FiChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <MdSort className="w-4 h-4 text-blue-500" />
                    {t("sortBy") || "ترتيب حسب"}
                  </span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered bg-white/50 focus:bg-white transition-all duration-300"
                >
                  <option value="newest">{t("newest") || "الأحدث"}</option>
                  <option value="oldest">{t("oldest") || "الأقدم"}</option>
                  <option value="most-viewed">
                    {t("mostViewed") || "الأكثر مشاهدة"}
                  </option>
                  <option value="most-liked">
                    {t("mostLiked") || "الأكثر إعجاباً"}
                  </option>
                  <option value="most-commented">
                    {t("mostCommented") || "الأكثر تعليقاً"}
                  </option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <MdPerson className="w-4 h-4 text-green-500" />
                    {t("author") || "الكاتب"}
                  </span>
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="select select-bordered bg-white/50 focus:bg-white transition-all duration-300"
                >
                  <option value="all">
                    {t("allAuthors") || "جميع الكتاب"}
                  </option>
                  {allAuthors
                    .filter((author) => author !== "all")
                    .map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <MdDateRange className="w-4 h-4 text-purple-500" />
                    {t("dateRange") || "الفترة الزمنية"}
                  </span>
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="select select-bordered bg-white/50 focus:bg-white transition-all duration-300"
                >
                  <option value="all">{t("allTime") || "كل الوقت"}</option>
                  <option value="today">{t("today") || "اليوم"}</option>
                  <option value="week">{t("thisWeek") || "هذا الأسبوع"}</option>
                  <option value="month">{t("thisMonth") || "هذا الشهر"}</option>
                  <option value="year">{t("thisYear") || "هذا العام"}</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <TbEye className="w-4 h-4 text-blue-500" />
                    {t("minViews") || "الحد الأدنى للمشاهدات"}
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minViews}
                  onChange={(e) => setMinViews(e.target.value)}
                  className="input input-bordered bg-white/50 focus:bg-white transition-all duration-300"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <RiFireLine className="w-4 h-4 text-red-500" />
                    {t("minLikes") || "الحد الأدنى للإعجابات"}
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minLikes}
                  onChange={(e) => setMinLikes(e.target.value)}
                  className="input input-bordered bg-white/50 focus:bg-white transition-all duration-300"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium opacity-0">
                    Actions
                  </span>
                </label>
                <button
                  onClick={clearAdvancedFilters}
                  className="btn btn-error btn-outline gap-2 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  <FiX className="w-4 h-4" />
                  {t("clearFilters") || "مسح المرشحات"}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <label className="label">
                <span className="label-text flex items-center gap-2 font-medium">
                  <HiTag className="w-4 h-4 text-emerald-500" />
                  {t("selectMultipleTags") || "اختر علامات متعددة"} (
                  {selectedTags.length} {t("selected") || "محدد"})
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags
                  .filter((tag) => tag !== "all")
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTagSelection(tag)}
                      className={`btn btn-sm gap-2 capitalize transition-all duration-300 rounded-xl ${
                        selectedTags.includes(tag)
                          ? "btn-primary shadow-lg"
                          : "btn-ghost bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200/50"
                      }`}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <FiX className="w-3 h-3" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {filteredBlogs.length === 0 ? (
          <div className="card bg-white/80 backdrop-blur-lg shadow-2xl border border-gray-200/50">
            <div className="card-body items-center text-center py-20">
              <BiSearch className="w-24 h-24 text-gray-400 mb-6" />
              <h2 className="card-title text-3xl text-gray-500 mb-4">
                {t("noArticlesFound")}
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                {searchTerm || selectedTag !== "all"
                  ? t("tryAdjustingSearch")
                  : t("beFirstToShare")}
              </p>
              {session && (
                <Link
                  href="/blogs/create"
                  className="btn btn-primary gap-3 text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FaPenFancy className="w-5 h-5" />
                  {t("writeYourFirstArticle")}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="card bg-white/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200/50 group rounded-3xl overflow-hidden"
              >
                <figure className="relative overflow-hidden">
                  <img
                    loading="lazy"
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  {/* Tags Overlay */}
                  <div
                    className={`absolute top-4 ${
                      isRTL ? "right-4" : "left-4"
                    } flex flex-wrap gap-2`}
                  >
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="badge bg-primary text-white badge-sm glass border-0 shadow-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {blog.featured && (
                    <div
                      className={`absolute top-4 ${
                        isRTL ? "left-4" : "right-4"
                      }`}
                    >
                      <span className="badge badge-warning badge-sm gap-1 text-white border-0 shadow-lg">
                        <HiFire className="w-3 h-3" />
                        {t("featured")}
                      </span>
                    </div>
                  )}
                </figure>

                <div className="card-body p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <BiUser className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">{blog.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="w-4 h-4 text-green-500" />
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString(
                          isRTL ? "ar-SA" : "en-US"
                        )}
                      </span>
                    </div>
                  </div>

                  <h2 className="card-title text-xl font-bold group-hover:text-primary transition-colors duration-300 mb-3 leading-tight">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="hover:no-underline line-clamp-2"
                    >
                      {blog.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <TbClock className="w-4 h-4 text-green-500" />
                        <span>
                          {blog.estimatedReadTime || 5} {t("minutes")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TbEye className="w-4 h-4 text-emerald-500" />
                        <span>{blog.views || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <RiFireLine className="w-4 h-4" />
                      <span>{blog.likesCount || 0}</span>
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="btn btn-primary gap-2 rounded-xl group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {t("readMore")}
                      <FaArrowRight
                        className={`w-3 h-3 group-hover:${
                          isRTL ? "translate-x-[-4px]" : "translate-x-1"
                        } transition-transform duration-300`}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-20">
          <div className="card bg-gradient-to-r from-green-600 via-emerald-600 to-emerald-700 text-white shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="card-body py-16 relative">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                ></div>
              </div>

              <FaLightbulb className="w-16 h-16 mx-auto mb-6 text-yellow-300 relative z-10" />
              <h2 className="card-title justify-center text-4xl mb-6 relative z-10">
                {t("doYouHaveSomethingToShare")}
              </h2>
              <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto leading-relaxed relative z-10">
                {t("joinOurWriterCommunity")}
              </p>
              {session ? (
                <Link
                  href="/blogs/create"
                  className="btn btn-lg glass text-white border-white hover:bg-white/20 gap-3 rounded-2xl px-8 relative z-10 transition-all duration-300 transform hover:scale-105"
                >
                  <FaPenFancy className="w-5 h-5" />
                  {t("startWritingNow")}
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="btn btn-lg glass text-white border-white hover:bg-white/20 gap-3 rounded-2xl px-8 relative z-10 transition-all duration-300 transform hover:scale-105"
                >
                  <BiUser className="w-5 h-5" />
                  {t("signInToWrite")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
