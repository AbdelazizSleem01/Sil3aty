"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
} from "react-icons/fa";
import {
  HiOutlineSparkles,
  HiPhotograph,
  HiHashtag,
  HiDocumentText,
  HiCursorClick,
} from "react-icons/hi";
import SimpleEditor from "../../../../components/SimpleEditor";

export default function CreateBlog() {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [tags, setTags] = useState("");
  const [topics, setTopics] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [authorBio, setAuthorBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setCoverImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      setError("You must be logged in to create a blog post");
      return;
    }

    if (!title || !content || !excerpt || !coverImage) {
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
      formData.append("coverImage", coverImage);
      formData.append("tags", tags);
      formData.append("topics", topics);
      formData.append("difficulty", difficulty);
      formData.append("featured", featured.toString());
      formData.append("published", published.toString());
      formData.append("authorBio", authorBio);

      const response = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create blog post");
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      router.push(`/blogs/${data.blog.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-2xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-error/10 rounded-2xl">
                <HiCursorClick className="w-12 h-12 text-error" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-error mb-2">
              Access Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in to create blog posts
            </p>
            <div className="card-actions justify-center">
              <button
                onClick={() => router.push("/auth/signin")}
                className="btn btn-primary gap-2"
              >
                <FaRocket className="w-4 h-4" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <HiDocumentText className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <HiOutlineSparkles className="text-yellow-500" />
            Create New Blog Post
            <span className="badge badge-primary badge-md">Draft</span>
          </h1>
          <p className="text-gray-600 text-md">
            Share your insights and stories with the community
          </p>
        </div>

        {error && (
          <div className="alert alert-error shadow-md mb-6 animate-fade-in">
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
              <h3 className="font-bold">Oops! Something went wrong</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl border border-gray-300">
          <div className="card-body p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-md font-semibold flex items-center gap-2">
                    <FaHeading className="w-4 h-4 text-primary" />
                    Blog Title
                    <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Catchy title that grabs attention..."
                  className="input input-bordered w-full text-md py-3 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Make it engaging and descriptive
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-md font-semibold flex items-center gap-2">
                    <FaParagraph className="w-4 h-4 text-primary" />
                    Short Description
                    <span className="text-error">*</span>
                  </span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of what readers can expect..."
                  className="textarea textarea-bordered w-full h-24 resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  maxLength={200}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {excerpt.length}/200 characters
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-md font-semibold flex items-center gap-2">
                    <HiPhotograph className="w-4 h-4 text-primary" />
                    Cover Image
                    <span className="text-error">*</span>
                  </span>
                </label>

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-md border-2 border-primary/20 transition-all duration-300 group-hover:border-primary/40"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setImagePreview("");
                          URL.revokeObjectURL(imagePreview);
                        }}
                        className="btn btn-error btn-sm btn-circle glass text-white"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      id="coverImage"
                      accept="image/*"
                      required
                    />
                    <label htmlFor="coverImage" className="cursor-pointer">
                      <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium mb-2">
                        Click to upload cover image
                      </p>
                      <p className="text-gray-500 text-sm">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-md font-semibold flex items-center gap-2">
                    <FaEdit className="w-4 h-4 text-primary" />
                    Blog Content
                    <span className="text-error">*</span>
                  </span>
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm bg-white">
                  <SimpleEditor value={content} onChange={setContent} />
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Use the formatting toolbar for rich text editing
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-semibold flex items-center gap-2">
                      <HiHashtag className="w-4 h-4 text-primary" />
                      Tags
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="technology, web-development, design..."
                    className="input input-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Separate tags with commas
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-semibold flex items-center gap-2">
                      <FaTag className="w-4 h-4 text-primary" />
                      Topics
                    </span>
                  </label>
                  <input
                    type="text"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="React, Node.js, Design, Marketing..."
                    className="input input-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Main topics covered in your post
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-semibold">
                      Difficulty Level
                    </span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="select select-bordered w-full focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-semibold">
                      Author Bio
                    </span>
                  </label>
                  <textarea
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Brief bio about yourself..."
                    className="textarea textarea-bordered w-full h-20 resize-none focus:ring-2 focus:ring-primary/20"
                    maxLength={200}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      {authorBio.length}/200 characters
                    </span>
                  </label>
                </div>
              </div>

              <div className="card bg-base-200/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaRocket className="w-4 h-4 text-primary" />
                  Publishing Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Featured Post</span>
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-gray-500 text-sm">
                        Show this post prominently on the homepage
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Publish Immediately</span>
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-gray-500 text-sm">
                        Make this post visible to all users
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaLightbulb className="w-4 h-4 text-yellow-500" />
                  Tip: Preview your post before publishing
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/blogs")}
                    className="btn gap-2 hover:bg-gray-100 transition-all duration-300"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FaRocket className="w-4 h-4" />
                        Publish Blog
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="stat bg-base-100 rounded-2xl shadow-sm border border-gray-300 text-center">
            <div className="stat-figure text-primary">
              <FaHeading className="w-4 h-4" />
            </div>
            <div className="stat-title text-md font-bold">Title Length</div>
            <div className="stat-value text-sm">{title.length}</div>
          </div>

          <div className="stat bg-base-100 rounded-2xl shadow-sm border border-gray-300 text-center">
            <div className="stat-figure text-secondary">
              <FaParagraph className="w-4 h-4" />
            </div>
            <div className="stat-title text-md font-bold">Content Words</div>
            <div className="stat-value text-sm">
              {
                content
                  .replace(/<[^>]*>/g, " ")
                  .split(/\s+/)
                  .filter((word) => word.trim().length > 0).length
              }
            </div>
          </div>

          <div className="stat bg-base-100 rounded-2xl shadow-sm border border-gray-300 text-center">
            <div className="stat-figure text-accent">
              <FaTag className="w-4 h-4" />
            </div>
            <div className="stat-title text-md font-bold">Tags Added</div>
            <div className="stat-value text-sm">
              {tags ? tags.split(",").length : 0}
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
