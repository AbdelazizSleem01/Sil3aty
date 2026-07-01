"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "../i18n";
import { 
  FaPlus, 
  FaSpinner, 
  FaArrowLeft, 
  FaTag, 
  FaLink, 
  FaImage,
  FaSave,
  FaLayerGroup,
  FaShieldVirus
} from "react-icons/fa";
import { compressImage } from "../lib/imageCompressor";

export default function CreateCategories() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      toast.error(t("pleaseLoginToAccess") || "Please login to access this page");
      router.push("/login");
      return;
    }

    if (session?.user?.isAdmin) {
      setIsAdmin(true);
    } else {
      toast.error(t("unauthorizedAccess") || "Unauthorized access - Admin privileges required");
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      try {
        toast.info("Optimizing category image...");
        const compressed = await compressImage(file, 400, 400, 0.7);
        setImageFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
        toast.success("Image optimized successfully");
      } catch (err) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", image);
      }

      const response = await fetch("/api/category", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      toast.success(t("categoryCreated"));
      
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1500);

    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (name || slug || imageFile) {
      if (confirm(t("confirmCancel") || "Are you sure you want to cancel? All unsaved changes will be lost.")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-700">{t("common.loading")}...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaShieldVirus className="text-8xl text-error mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-error mb-4">{t("accessDenied") || "Access Denied"}</h2>
          <p className="text-gray-600 text-lg">{t("redirecting") || "Redirecting to authorized page..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <FaLayerGroup className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t("createNewCategory")}</h1>
              <p className="text-gray-600 mt-1">{t("addNewCategoryDescription") || "Add a new product category to your store"}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaTag className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">{t("categoryName")}</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t("enterCategoryName")}
                value={name}
                onChange={handleNameChange}
                className={`input input-bordered input-primary w-full text-md py-3 ${isRTL ? 'text-right' : 'text-left'}`}
                required
                maxLength={100}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {name.length}/100
              </div>
            </div>

            {/* Slug */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaLink className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">{t("categorySlug")}</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t("enterSlug")}
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className={`input input-bordered input-primary w-full text-md py-3 font-mono ${isRTL ? 'text-right' : 'text-left'}`}
                required
                maxLength={100}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{t("slugAutoGenerated")}</span>
                <span>{slug.length}/100</span>
              </div>
            </div>

            {/* Category Image Upload */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">{t("categoryImage")}</span>
                <span className="text-gray-400">({t("optional") || "Optional"})</span>
              </label>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-6 bg-base-50 hover:bg-base-100 transition-colors relative group min-h-[200px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {previewUrl ? (
                  <div className="relative w-full flex flex-col items-center z-20">
                    <img
                      src={previewUrl}
                      alt="Category preview"
                      className="w-full max-w-[200px] h-48 object-cover rounded-xl shadow-md border border-base-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-3 btn btn-sm btn-error btn-outline"
                    >
                      {t("removeImage") || "Remove Image"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-2 py-4">
                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                      <FaImage className="text-3xl" />
                    </div>
                    <span className="font-semibold text-gray-700">
                      {t("clickToUploadImage") || "Click or drag to upload category image"}
                    </span>
                    <span className="text-sm text-gray-400">
                      PNG, JPG, WEBP (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="btn flex-1 text-md py-3"
                disabled={loading}
              >
                {t("common.cancel")}
              </button>
              
              <button
                type="submit"
                className="btn btn-primary flex-1 text-md py-3 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {t("common.submitting")}...
                  </>
                ) : (
                  <>
                    <FaSave />
                    {t("createCategory")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}