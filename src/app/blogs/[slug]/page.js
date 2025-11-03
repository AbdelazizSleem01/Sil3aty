"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaLink,
  FaEdit,
  FaShareAlt,
  FaBookmark,
  FaHeart,
  FaArrowLeft,
  FaTag,
  FaComment,
  FaReadme,
  FaStar,
  FaRegBookmark,
  FaRegHeart,
  FaRegComment,
} from "react-icons/fa";
import {
  HiOutlineSparkles,
  HiUserCircle,
  HiCalendar,
  HiClock,
  HiShare,
  HiBookmark,
  HiHeart,
  HiArrowLeft,
  HiTag,
  HiFire,
} from "react-icons/hi";
import {
  RiUser3Line,
  RiBookmarkFill,
  RiHeartFill,
  RiShareForwardLine,
} from "react-icons/ri";
import { BiComment, BiLike, BiBookmark } from "react-icons/bi";
import { TbClock, TbCalendar, TbEye } from "react-icons/tb";
import { MdOutlineFeaturedPlayList, MdOutlineTrendingUp } from "react-icons/md";
import Image from "next/image";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const MDEditor = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 animate-pulse rounded-2xl border-2 border-dashed border-green-200 flex items-center justify-center">
      <div className="text-center">
        <HiOutlineSparkles className="w-10 h-10 text-green-400 mx-auto mb-3 animate-pulse" />
        <p className="text-green-600 font-medium">{t("loadingContent")}</p>
      </div>
    </div>
  ),
});

export default function BlogDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [authorArticlesCount, setAuthorArticlesCount] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        await fetch(`/api/blog/${slug}/view`, { method: "POST" });
        const response = await fetch(`/api/blog/${slug}/view`);
        if (!response.ok) throw new Error(t("failedToLoadArticle"));
        const data = await response.json();

        const blogData = data.blog;
        setBlog(blogData);
        setLikeCount(blogData.likesCount || 0);
        setViews(blogData.views || 0);
        setReadingTime(blogData.estimatedReadTime || 5);

        if (session?.user?.id) {
          setIsLiked(blogData.likes?.includes(session.user.id) || false);
          setIsBookmarked(blogData.bookmarks?.includes(session.user.id) || false);
        }

        const commentsResponse = await fetch(`/api/blog/${slug}/comment`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments || []);
        }

        if (blogData.author?._id) {
          const authorResponse = await fetch(`/api/blog/author/${blogData.author._id}`);
          if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            setAuthorArticlesCount(authorData.articlesCount || 0);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlog();
  }, [slug, session, t]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const handleLike = async () => {
    if (!session) {
      toast.error(t("loginRequired"));
      return;
    }

    try {
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likesCount);
        toast.success(data.liked ? t("liked") : t("unliked"));
      } else {
        toast.error(t("likeFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      toast.error(t("loginRequired"));
      return;
    }

    try {
      const response = await fetch(`/api/blog/${slug}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? t("bookmarked") : t("unbookmarked"));
      } else {
        toast.error(t("bookmarkFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    }
  };

  const handleAddComment = async () => {
    if (!session) {
      toast.error(t("loginRequired"));
      return;
    }

    if (!newComment.trim()) {
      toast.error(t("commentRequired"));
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/blog/${slug}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment("");
        toast.success(t("commentPosted"));
      } else {
        toast.error(t("commentFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    } finally {
      setIsSubmittingComment(false);
    }
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
            {t("loadingBlogPost")}
          </h2>
          <p className="text-gray-600">{t("preparingBestContent")}</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center px-4">
        <div className="card bg-white/80 backdrop-blur-lg shadow-2xl w-full max-w-md border-0">
          <div className="card-body text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-rose-100 to-emerald-100 rounded-2xl shadow-lg">
                <HiFire className="w-16 h-16 text-rose-500" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-rose-600 mb-2">
              {error ? t("errorOccurred") : t("articleNotFound")}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || t("articleNotExist")}
            </p>
            <div className="card-actions justify-center">
              <Link
                href="/blogs"
                className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <HiArrowLeft className="w-4 h-4" />
                {t("backToBlogs")}
              </Link>
                </div>
              </div>
            </div>

          </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-50">
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/blogs"
              className="group btn btn-ghost gap-2 text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:bg-emerald-50 rounded-xl font-medium"
            >
              <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t("backToBlogs")}
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                    isBookmarked
                      ? "bg-amber-100 text-amber-600 shadow-md"
                      : "bg-white/80 text-gray-600 hover:bg-amber-100 hover:text-amber-600 shadow-sm"
                  }`}
                >
                  {isBookmarked ? (
                    <RiBookmarkFill className="w-5 h-5" />
                  ) : (
                    <BiBookmark className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 flex items-center gap-2 ${
                    isLiked
                      ? "bg-rose-100 text-rose-600 shadow-md"
                      : "bg-white/80 text-gray-600 hover:bg-rose-100 hover:text-rose-600 shadow-sm"
                  }`}
                >
                  {isLiked ? (
                    <RiHeartFill className="w-5 h-5" />
                  ) : (
                    <BiLike className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <article className="bg-white rounded-3xl p-4 shadow-2xl border border-gray-100/80 overflow-hidden mb-8 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
          <div className="relative">
            <div className="relative mx-auto h-[60vh] w-[80vw] sm:h-[90vh] md:w-[70vw] lg:w-[40vw] rounded-3xl overflow-hidden">
              <Image
                loading="lazy"
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover rounded-3xl"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 40vw"
              />
            </div>

            <div className="absolute top-6 left-6 flex gap-2">
              {blog.featured && (
                <span className="badge badge-lg bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white shadow-lg gap-1 backdrop-blur-sm">
                  <MdOutlineFeaturedPlayList className="w-4 h-4" />
                  {t("featured")}
                </span>
              )}
              <span className="badge badge-lg bg-gray-400/80 backdrop-blur-md text-white border-0 shadow-lg gap-1">
                <MdOutlineTrendingUp className="w-4 h-4" />
                {t("trending")}
              </span>
              <span className="badge badge-lg bg-emerald-500 backdrop-blur-md text-white border-0 shadow-lg gap-1">
                <FaStar className="w-3 h-3" />
                {blog.difficulty === "beginner"
                  ? t("beginner")
                  : blog.difficulty === "intermediate"
                  ? t("intermediate")
                  : t("advanced")}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-emerald-50/80 to-emerald-50/80 rounded-2xl border border-emerald-100/50 backdrop-blur-sm">
              <div className="avatar">
                <div className="w-16 rounded-full ring-2 ring-white shadow-lg">
                  <img
                    src={blog.author?.profilePicture || "/images/default-avatar.png"}
                    alt={blog.author?.name || t("authorUnknown")}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <RiUser3Line className="w-5 h-5 text-emerald-500" />
                  {blog.author?.name || t("authorUnknown")}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                  <span className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200/50">
                    <TbCalendar className="w-4 h-4 text-emerald-500" />
                    {new Date(blog.publishedAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200/50">
                    <TbClock className="w-4 h-4 text-green-500" />
                    {readingTime} {t("minRead")}
                  </span>
                  <span className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200/50">
                    <TbEye className="w-4 h-4 text-green-500" />
                    {views} {t("views")}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-emerald-600 to-green-600 bg-clip-text text-transparent">
              {blog.title}
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed border-r-4 border-emerald-500 pr-6 py-3 bg-gradient-to-l from-emerald-50/50 to-transparent rounded-l-2xl">
              {blog.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
              {blog.tags?.map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs?tag=${tag}`}
                  className="badge badge-lg bg-gradient-to-r from-emerald-100 to-emerald-100 text-emerald-700 border-0 hover:from-emerald-200 hover:to-emerald-200 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md backdrop-blur-sm"
                >
                  <HiTag className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50 sticky top-24">
              <div className="card-body p-6">
                <h3 className="card-title text-lg flex items-center gap-3 mb-4 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-xl shadow-md">
                    <RiShareForwardLine className="w-5 h-5 text-white" />
                  </div>
                  {t("shareArticle")}
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-ghost justify-start gap-3 w-full hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 rounded-xl font-medium"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FaLink className="w-4 h-4" />
                    </div>
                    {t("copyLink")}
                  </button>
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    className="btn btn-ghost justify-start gap-3 w-full text-emerald-600 hover:bg-emerald-50 transition-all duration-300 rounded-xl font-medium"
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FaFacebook className="w-4 h-4" />
                    </div>
                    {t("shareOnFacebook")}
                  </Link>
                  <Link
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                    target="_blank"
                    className="btn btn-ghost justify-start gap-3 w-full text-emerald-400 hover:bg-emerald-50 transition-all duration-300 rounded-xl font-medium"
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FaTwitter className="w-4 h-4" />
                    </div>
                    {t("shareOnTwitter")}
                  </Link>
                  <Link
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`}
                    target="_blank"
                    className="btn btn-ghost justify-start gap-3 w-full text-emerald-700 hover:bg-emerald-50 transition-all duration-300 rounded-xl font-medium"
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FaLinkedin className="w-4 h-4" />
                    </div>
                    {t("shareOnLinkedIn")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50/80 to-emerald-50/80 shadow-xl border border-emerald-100/50 backdrop-blur-sm">
              <div className="card-body p-6 text-center">
                <div className="avatar mb-4">
                  <div className="w-20 h-20 rounded-full ring-4 ring-white/80 shadow-lg mx-auto">
                    <Image
                      src={blog.author?.profilePicture || "/images/default-avatar.png"}
                      alt={blog.author?.name || t("authorUnknown")}
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-1">
                  {blog.author?.name || t("authorUnknown")}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{t("articleAuthor")}</p>

                <div className="stats stats-vertical shadow bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                  <div className="stat p-4">
                    <div className="stat-figure text-emerald-500">
                      <FaReadme className="w-5 h-5" />
                    </div>
                    <div className="stat-title text-gray-600">{t("articles")}</div>
                    <div className="stat-value text-lg text-gray-800">
                      {authorArticlesCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-gray-200/50">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === "content"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FaReadme className="w-4 h-4" />
                  {t("articleContent")}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === "comments"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <BiComment className="w-4 h-4" />
                  {t("comments")} ({comments.length})
                </span>
              </button>
            </div>

            {activeTab === "content" && (
              <div className="card bg-white/80 backdrop-blur-lg shadow-2xl border border-gray-200/50">
                <div className="card-body p-8">
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-img:rounded-2xl prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="card bg-white/80 backdrop-blur-lg shadow-xl border border-gray-200/50">
                <div className="card-body p-8">
                  {session ? (
                    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50/80 to-emerald-50/80 rounded-2xl border border-emerald-100/50">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        {t("addYourComment")}
                      </h4>
                      <div className="flex gap-4">
                        <div className="avatar flex-shrink-0">
                          <div className="w-12 h-12 rounded-full ring-2 ring-emerald-500 shadow-md">
                            <Image
                              src={session.user.image || "/images/default-avatar.png"}
                              alt={session.user.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t("shareYourThoughts")}
                            className="textarea textarea-bordered w-full h-24 resize-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80 backdrop-blur-sm"
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500">
                              {newComment.length}/500 {t("characters")}
                            </span>
                            <button
                              onClick={handleAddComment}
                              disabled={isSubmittingComment || !newComment.trim()}
                              className="btn btn-primary gap-2 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              {isSubmittingComment ? (
                                <>
                                  <span className="loading loading-spinner loading-sm"></span>
                                  {t("posting")}...
                                </>
                              ) : (
                                <>
                                  <BiComment className="w-4 h-4" />
                                  {t("postComment")}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-300/50 mb-8 backdrop-blur-sm">
                      <BiComment className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4 text-lg">
                        {t("loginToComment")}
                      </p>
                      <Link
                        href="/auth/signin"
                        className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {t("signIn")}
                      </Link>
                    </div>
                  )}

                  <div className="space-y-6">
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <BiComment className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-600 mb-2">
                          {t("noCommentsYet")}
                        </h4>
                        <p className="text-gray-500 text-lg">
                          {t("beTheFirstToComment")}
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="flex gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <div className="avatar flex-shrink-0">
                            <div className="w-12 h-12 rounded-full ring-2 ring-emerald-500/30 shadow-md">
                              <Image
                                src={comment.user?.profilePicture || "/images/default-avatar.png"}
                                alt={comment.user?.name || t("anonymousUser")}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="font-semibold text-gray-800 text-lg">
                                {comment.user?.name || t("anonymousUser")}
                              </h5>
                              <span className="text-sm text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
                                {new Date(comment.createdAt).toLocaleDateString("ar-SA", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`btn gap-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                isLiked
                  ? "btn-error text-white shadow-lg"
                  : "btn-ghost bg-white/80 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              {isLiked ? (
                <RiHeartFill className="w-5 h-5" />
              ) : (
                <BiLike className="w-5 h-5" />
              )}
              <span className="font-medium">
                {likeCount} {isLiked ? t("liked") : t("like")}
              </span>
            </button>
            <button
              onClick={handleBookmark}
              className={`btn gap-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                isBookmarked
                  ? "btn-warning text-white shadow-lg"
                  : "btn-ghost bg-white/80 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              {isBookmarked ? (
                <RiBookmarkFill className="w-5 h-5" />
              ) : (
                <BiBookmark className="w-5 h-5" />
              )}
              {isBookmarked ? t("saved") : t("save")}
            </button>
          </div>

          {session?.user?.id === blog.author?._id && (
            <Link
              href={`/blogs/${blog.slug}/edit`}
              className="btn btn-primary gap-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <FaEdit className="w-4 h-4" />
              {t("editArticle")}
            </Link>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLike}
            className={`btn btn-circle shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 ${
              isLiked ? "btn-error" : "btn-primary"
            }`}
          >
            {isLiked ? (
              <RiHeartFill className="w-6 h-6" />
            ) : (
              <BiLike className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={handleBookmark}
            className={`btn btn-circle shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 ${
              isBookmarked ? "btn-warning" : "btn-primary"
            }`}
          >
            {isBookmarked ? (
              <RiBookmarkFill className="w-6 h-6" />
            ) : (
              <BiBookmark className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
