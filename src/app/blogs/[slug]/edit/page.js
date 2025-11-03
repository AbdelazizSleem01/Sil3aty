"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  FaSave,
  FaTimes,
  FaUpload,
  FaTag,
  FaHeading,
  FaParagraph,
  FaImage,
  FaRocket,
  FaLightbulb,
  FaEdit,
  FaEye,
  FaMagic,
  FaCloudUploadAlt,
  FaSyncAlt,
} from "react-icons/fa";
import {
  HiOutlineSparkles,
  HiPhotograph,
  HiHashtag,
  HiDocumentText,
  HiCursorClick,
  HiCloudUpload,
  HiColorSwatch,
  HiRefresh,
} from "react-icons/hi";
import SimpleEditor from "../../../../../components/SimpleEditor";
import TagInput from "../../../../../components/TagInput";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gradient-to-br from-gray-100 to-emerald-50 animate-pulse rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <HiOutlineSparkles className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-gray-500 text-sm">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function EditBlog() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [useCustomSlug, setUseCustomSlug] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch blog");
        const data = await response.json();

        if (data.author._id !== session?.user?.id && !session?.user?.isAdmin) {
          router.push("/blogs");
          return;
        }

        setBlog(data);
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt);
        setExistingImage(data.coverImage);
        setImagePreview(data.coverImage);
        setTags(data.tags || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (slug && session) fetchBlog();
  }, [slug, session, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setCoverImage(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      setError("You must be logged in to edit a blog post");
      return;
    }

    if (!title || !content || !excerpt) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("excerpt", excerpt);
      if (coverImage) formData.append("coverImage", coverImage);
      formData.append("tags", JSON.stringify(tags));
      formData.append(
        "authorAvatar",
        session.user.profilePicture || "/images/default-avatar.png"
      );

      // Handle slug
      if (useCustomSlug && customSlug.trim()) {
        formData.append("slug", customSlug.trim());
      }

      const response = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update blog post");
      }

      // Cleanup preview URL
      if (imagePreview && imagePreview !== existingImage) {
        URL.revokeObjectURL(imagePreview);
      }

      router.push(`/blogs/${slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <HiOutlineSparkles className=" w-10 h-10 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Loading Blog Post
          </h2>
          <p className="text-gray-600 text-lg">Preparing the editor...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="card bg-white shadow-2xl w-full max-w-md border-0 rounded-3xl">
          <div className="card-body text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-rose-100 to-emerald-100 rounded-2xl">
                <HiCursorClick className="w-16 h-16 text-rose-500" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-rose-600 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              Blog not found or you don't have permission to edit it
            </p>
            <div className="card-actions justify-center">
              <button
                onClick={() => router.push("/blogs")}
                className="btn btn-primary gap-2 rounded-2xl"
              >
                <FaRocket className="w-4 h-4" />
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-lg">
              <HiDocumentText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <HiOutlineSparkles className="text-yellow-500 animate-pulse" />
            Edit Blog Post
            <span className="badge badge-primary badge-lg bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-lg">
              Editing
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Update and refine your amazing content
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error shadow-lg mb-6 animate-fade-in border-0 bg-gradient-to-r from-rose-500 to-emerald-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Update Failed!</h3>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        <div className="card bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="card-body p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <FaHeading className="w-5 h-5 text-green-600" />
                    </div>
                    Blog Title
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Catchy title that grabs attention..."
                  className="input input-bordered w-full text-lg py-4 focus:ring-3 focus:ring-green-200 border-2 transition-all duration-300 rounded-2xl"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500 flex items-center gap-1">
                    <FaLightbulb className="w-4 h-4 text-yellow-500" />
                    Make it engaging and descriptive
                  </span>
                </label>
              </div>

              {/* Excerpt */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <FaParagraph className="w-5 h-5 text-emerald-600" />
                    </div>
                    Short Description
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of what readers can expect..."
                  className="textarea textarea-bordered w-full h-28 resize-none focus:ring-3 focus:ring-emerald-200 border-2 transition-all duration-300 rounded-2xl text-lg"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {excerpt.length}/200 characters
                  </span>
                </label>
              </div>

              {/* Cover Image with Drag & Drop */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <HiPhotograph className="w-5 h-5 text-green-600" />
                    </div>
                    Cover Image
                  </span>
                </label>

                {imagePreview ? (
                  <div className="relative h-72 group ">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-[30%] h-[50vh]  object-cotain rounded-2xl border-4 border-green-200 transition-all duration-500 group-hover:border-green-400 shadow-lg"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setImagePreview(existingImage);
                          if (imagePreview !== existingImage) {
                            URL.revokeObjectURL(imagePreview);
                          }
                        }}
                        className="btn btn-error btn-circle glass text-white shadow-lg transform hover:scale-110 transition-all duration-300"
                        title="Reset to original"
                      >
                        <HiRefresh className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setImagePreview("");
                          if (imagePreview !== existingImage) {
                            URL.revokeObjectURL(imagePreview);
                          }
                        }}
                        className="btn btn-error btn-circle glass text-white shadow-lg transform hover:scale-110 transition-all duration-300"
                        title="Remove image"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-3">
                      <span className="badge badge-lg glass text-white shadow-lg">
                        {coverImage ? "New Image" : "Current Image"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 ${
                      isDragging
                        ? "border-green-400 bg-green-100 scale-105"
                        : "border-green-200 hover:border-green-400 hover:bg-green-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      id="coverImage"
                      accept="image/*"
                    />
                    <label htmlFor="coverImage" className="cursor-pointer">
                      <FaCloudUploadAlt className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-700 font-bold text-lg mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500">
                        PNG, JPG, WEBP - Maximum 5MB
                      </p>
                      <p className="text-green-500 text-sm mt-2">
                        ✨ Drag & drop supported
                      </p>
                    </label>
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="form-control mt-6">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <FaEdit className="w-5 h-5 text-amber-600" />
                    </div>
                    Blog Content
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
                  <div data-color-mode="light">
                    <SimpleEditor
                      value={content}
                      onChange={setContent}
                      height={400}
                      preview="edit"
                    />
                  </div>
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500 flex items-center gap-1">
                    <FaMagic className="w-4 h-4 text-green-500" />
                    Use markdown for rich text formatting
                  </span>
                </label>
              </div>

              {/* Slug Management */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <HiHashtag className="w-5 h-5 text-emerald-600" />
                    </div>
                    URL Slug
                  </span>
                </label>

                <div className="space-y-3">
                  {/* Current Slug Display */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                    <span className="text-sm text-gray-600 font-medium">
                      Current:
                    </span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {blog?.slug}
                    </span>
                  </div>

                  {/* Custom Slug Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="useCustomSlug"
                      checked={useCustomSlug}
                      onChange={(e) => setUseCustomSlug(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <label
                      htmlFor="useCustomSlug"
                      className="text-sm font-medium text-gray-700"
                    >
                      Use custom slug
                    </label>
                  </div>

                  {/* Custom Slug Input */}
                  {useCustomSlug && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="custom-blog-slug"
                        className="input input-bordered w-full focus:ring-3 focus:ring-emerald-200 border-2 transition-all duration-300 rounded-2xl"
                      />
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Preview:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          /blogs/{customSlug || "your-slug-here"}
                        </span>
                        {customSlug && (
                          <span className="text-emerald-600 font-medium">
                            ✓ Custom slug set
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Generated Slug Preview */}
                  {!useCustomSlug && title !== blog?.title && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-sm text-emerald-700 font-medium mb-1">
                        Generated from title:
                      </div>
                      <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {title
                          .toLowerCase()
                          .replace(/[^\w\s]/gi, "")
                          .replace(/\s+/g, "-")
                          .substring(0, 60)}
                      </div>
                    </div>
                  )}
                </div>

                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {useCustomSlug
                      ? "Custom slug for URL"
                      : "Slug will be generated from title if changed"}
                  </span>
                </label>
              </div>

              {/* Tags */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-bold flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-cyan-100 rounded-xl">
                      <HiHashtag className="w-5 h-5 text-cyan-600" />
                    </div>
                    Tags
                  </span>
                </label>
                <TagInput
                  tags={tags}
                  setTags={setTags}
                  placeholder="اكتب علامة واضغط Enter"
                  maxTags={10}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    اكتب العلامة واضغط Enter للإضافة
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaLightbulb className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">
                    Tip: Preview your changes before updating
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/blogs/${slug}`)}
                    className="btn gap-3 hover:bg-gray-100 transition-all duration-300 rounded-2xl border-2 border-gray-200 font-medium"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-5 h-5" />
                        Update Blog
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="stat bg-white rounded-2xl shadow-lg border border-gray-200 text-center p-6">
            <div className="stat-figure text-green-500 mb-2">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaHeading className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-title text-md font-bold text-gray-600">
              Title Length
            </div>
            <div className="stat-value text-2xl text-gray-800">
              {title.length}
            </div>
          </div>

          <div className="stat bg-white rounded-2xl shadow-lg border border-gray-200 text-center p-6">
            <div className="stat-figure text-emerald-500 mb-2">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FaParagraph className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-title text-md font-bold text-gray-600">
              Content Words
            </div>
            <div className="stat-value text-2xl text-gray-800">
              {
                content
                  .replace(/<[^>]*>/g, " ")
                  .split(/\s+/)
                  .filter((word) => word.trim().length > 0).length
              }
            </div>
          </div>

          <div className="stat bg-white rounded-2xl shadow-lg border border-gray-200 text-center p-6">
            <div className="stat-figure text-cyan-500 mb-2">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <FaTag className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-title text-md font-bold text-gray-600">
              Tags Added
            </div>
            <div className="stat-value text-2xl text-gray-800">
              {tags.length}
            </div>
          </div>

          <div className="stat bg-white rounded-2xl shadow-lg border border-gray-200 text-center p-6">
            <div className="stat-figure text-emerald-500 mb-2">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <HiHashtag className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-title text-md font-bold text-gray-600">
              Slug Status
            </div>
            <div className="stat-value text-lg text-gray-800">
              {useCustomSlug ? "Custom" : "Auto"}
            </div>
            <div className="stat-desc text-xs text-gray-500">
              {useCustomSlug ? "Using custom slug" : "Auto-generated"}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
