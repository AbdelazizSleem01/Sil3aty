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
  Fash,
  FaShieldVirus
} from "react-icons/fa";

export default function CreateCategories() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      toast.error(t("pleaseLoginToAccess") || "Please login to access this page");
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
      toast.error(t("unauthorizedAccess") || "Unauthorized access - Admin privileges required");
      router.push("/unauthorized");
      return;
    }

    if (session?.user?.isAdmin) {
      setIsAdmin(true);
    }
  }, [session, status, router]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    if (newName && !slug) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          slug: slug.trim(), 
          image: image.trim() 
        }),
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
    if (name || slug || image) {
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

            {/* Image URL */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">{t("categoryImage")}</span>
                <span className="text-gray-400">({t("optional") || "Optional"})</span>
              </label>
              <input
                type="url"
                placeholder={t("enterImageUrl")}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={`input input-bordered input-primary w-full text-md py-3 ${isRTL ? 'text-right' : 'text-left'}`}
              />
              
              {/* Image Preview */}
              {image && (
                <div className="mt-4 p-4 border-2 border-dashed border-info rounded-lg bg-info/10">
                  <p className="font-semibold text-info mb-2 flex items-center gap-2">
                    <FaImage />
                    {t("imagePreview")}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={image}
                      alt="Category preview"
                      className="w-20 h-20 object-cover rounded-lg bg-white shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hidden"
                    >
                      <FaImage className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm break-all">{image}</p>
                      <p className="text-xs text-gray-500 mt-1">Live preview</p>
                    </div>
                  </div>
                </div>
              )}
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

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-info/10 rounded-lg border border-info/20">
            <h3 className="font-semibold text-info mb-2 flex items-center gap-2">
              <FaPlus />
              {t("quickTips") || "Quick Tips"}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t("categoryNameTip") || "Category names should be clear and descriptive"}</li>
              <li>• {t("slugTip") || "Slugs are auto-generated but can be customized"}</li>
              <li>• {t("imageTip") || "Use high-quality images for better presentation"}</li>
              <li>• {t("slugShortTip") || "Keep slugs short and URL-friendly"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}