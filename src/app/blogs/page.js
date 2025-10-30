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
import { TbClock, TbEye, TbTrendingUp } from "react-icons/tb";
import { TrendingUp } from "lucide-react";
import { IoTrendingUpOutline } from "react-icons/io5";

export default function BlogsPage() {
  const { data: session } = useSession();
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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blog");
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogs(data);

        // حساب الإحصائيات
        calculateStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

    // حساب المشاهدات الشهرية (نفترض 30% من إجمالي المشاهدات)
    const monthlyViews = Math.round(totalViews * 0.3);

    setStats({
      totalViews,
      totalLikes,
      totalComments,
      monthlyViews,
    });
  };

  // Extract unique tags
  const allTags = ["all", ...new Set(blogs.flatMap((blog) => blog.tags))];

  // Filter blogs based on search and tag
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "all" || blog.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <HiOutlineSparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            جاري تحميل المدونات
          </h2>
          <p className="text-gray-600">نحضر لك أحدث المقالات...</p>
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
              حدث خطأ
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="card-actions justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaRocket className="w-4 h-4" />
                المحاولة مرة أخرى
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-emerald-700 text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
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
          <h1 className="text-5xl md:text-6xl font-bold mb-10 ">
            المدونة الإلكترونية
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
            اكتشف أحدث الأفكار والرؤى والقصص من مجتمعنا المتميز. استكشف مقالاتنا
            المتنوعة وانضم إلى النقاش.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <BiSearch className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث في المدونات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pr-12 pl-4 py-4 text-gray-800 bg-white/95 backdrop-blur-lg border-white/20 focus:border-white/40 rounded-2xl text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl shadow-lg">
                  <RiEyeLine className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="stat-title text-gray-600 mb-1">
                إجمالي المشاهدات
              </div>
              <div className="stat-value text-2xl text-gray-800">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="stat-desc text-green-500 flex items-center justify-center gap-1">
                <TbTrendingUp className="w-4 h-4" />
                +12% هذا الشهر
              </div>
            </div>
          </div>

          <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="stat-title text-gray-600 mb-1">الإعجابات</div>
              <div className="stat-value text-2xl text-gray-800">
                {stats.totalLikes.toLocaleString()}
              </div>
              <div className="stat-desc text-emerald-500 flex items-center justify-center gap-1">
                <HiTrendingUp className="w-4 h-4" />
                +8% هذا الشهر
              </div>
            </div>
          </div>

          <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <FaComments className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="stat-title text-gray-600 mb-1">التعليقات</div>
              <div className="stat-value text-2xl text-gray-800">
                {stats.totalComments.toLocaleString()}
              </div>
              <div className="stat-desc text-green-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +15% هذا الشهر
              </div>
            </div>
          </div>

          <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                  <HiFire className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="stat-title text-gray-600 mb-1">مشاهدات الشهر</div>
              <div className="stat-value text-2xl text-gray-800">
                {stats.monthlyViews.toLocaleString()}
              </div>
              <div className="stat-desc text-orange-500 flex items-center justify-center gap-1">
                <RiFireLine className="w-4 h-4" />
                +20% عن الشهر الماضي
              </div>
            </div>
          </div>
        </div>

        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
              <HiOutlineSparkles className="text-yellow-500 w-8 h-8" />
              أحدث المقالات
              <span className="badge badge-primary badge-lg text-white shadow-lg">
                {filteredBlogs.length}{" "}
                {filteredBlogs.length === 1 ? "مقال" : "مقال"}
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              استكشف مجموعتنا المتنوعة من المقالات المفيدة
            </p>
          </div>

          {session && (
            <Link
              href="/blogs/create"
              className="btn btn-primary gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl px-6 py-3 text-lg font-medium"
            >
              <BiPlus className="w-5 h-5" />
              إنشاء مقال جديد
            </Link>
          )}
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <HiTag className="w-5 h-5 text-emerald-500" />
            التصنيفات:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`btn gap-2 capitalize transition-all duration-300 rounded-xl ${
                selectedTag === tag
                  ? "btn-primary shadow-lg"
                  : "btn-ghost bg-white/80 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200/50"
              }`}
            >
              <RiUser3Line className="w-4 h-4" />
              {tag === "all" ? "الكل" : tag}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="card bg-white/80 backdrop-blur-lg shadow-2xl border border-gray-200/50">
            <div className="card-body items-center text-center py-20">
              <BiSearch className="w-24 h-24 text-gray-400 mb-6" />
              <h2 className="card-title text-3xl text-gray-500 mb-4">
                لم يتم العثور على مقالات
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                {searchTerm || selectedTag !== "all"
                  ? "حاول تعديل معايير البحث أو التصفية"
                  : "كن أول من يشارك أفكاره ورؤاه!"}
              </p>
              {session && (
                <Link
                  href="/blogs/create"
                  className="btn btn-primary gap-3 text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FaPenFancy className="w-5 h-5" />
                  اكتب أول مقال لك
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
                {/* Image with Overlay */}
                <figure className="relative overflow-hidden">
                  <img
                    loading="lazy"
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  {/* Tags Overlay */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-primary badge-sm glass text-white border-0 shadow-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Featured Badge */}
                  {blog.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="badge badge-warning badge-sm gap-1 text-white border-0 shadow-lg">
                        <HiFire className="w-3 h-3" />
                        مميز
                      </span>
                    </div>
                  )}
                </figure>

                <div className="card-body p-6">
                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <BiUser className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">{blog.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="w-4 h-4 text-green-500" />
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="card-title text-xl font-bold group-hover:text-primary transition-colors duration-300 mb-3 leading-tight">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="hover:no-underline line-clamp-2"
                    >
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                    {blog.excerpt}
                  </p>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <TbClock className="w-4 h-4 text-green-500" />
                        <span>{blog.estimatedReadTime || 5} دقيقة</span>
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

                  {/* Read More Button */}
                  <div className="card-actions justify-end">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="btn btn-primary gap-2 rounded-xl group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      اقرأ المزيد
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="card bg-gradient-to-r from-green-600 via-emerald-600 to-emerald-700 text-white shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="card-body py-16 relative">
              {/* Background Pattern */}
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
                هل لديك ما تشاركه؟
              </h2>
              <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto leading-relaxed relative z-10">
                انضم إلى مجتمع الكتاب لدينا وشارك رؤاك مع آلاف القراء. كن جزءًا
                من رحلة المعرفة والإلهام.
              </p>
              {session ? (
                <Link
                  href="/blogs/create"
                  className="btn btn-lg glass text-white border-white hover:bg-white/20 gap-3 rounded-2xl px-8 relative z-10 transition-all duration-300 transform hover:scale-105"
                >
                  <FaPenFancy className="w-5 h-5" />
                  ابدأ الكتابة الآن
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="btn btn-lg glass text-white border-white hover:bg-white/20 gap-3 rounded-2xl px-8 relative z-10 transition-all duration-300 transform hover:scale-105"
                >
                  <BiUser className="w-5 h-5" />
                  سجل الدخول للكتابة
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
