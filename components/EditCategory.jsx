"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Image from "next/image";
import "../i18n";
import { 
  FaEdit, 
  FaSpinner, 
  FaArrowLeft, 
  FaTag, 
  FaLink, 
  FaImage,
  FaSave,
  FaLayerGroup,
  FaTrash,
  FaEye,
  FaSync
} from "react-icons/fa";

export default function EditCategory() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/category/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch category");
        }
        
        setName(data.name);
        setSlug(data.slug);
        setImage(data.image || "");
        setOriginalData(data);
        
      } catch (err) {
        Swal.fire({
          title: t("common.error"),
          text: err.message,
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
        setTimeout(() => {
          router.push("/admin/categories");
        }, 2000);
      } finally {
        setFetching(false);
      }
    };
    
    fetchCategory();
  }, [id, router]);

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
    
    if (newName && (!slug || slug === generateSlug(originalData?.name))) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      Swal.fire({
        title: t("common.error"),
        text: t("fillRequiredFields"),
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          slug: slug.trim(), 
          image: image.trim() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      Swal.fire({
        title: t("categoryUpdated"),
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1500,
      });

      setTimeout(() => {
        router.push("/admin/categories");
      }, 1500);

    } catch (err) {
      Swal.fire({
        title: t("common.error"),
        text: err.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const hasChanges =
      name !== originalData?.name ||
      slug !== originalData?.slug ||
      image !== (originalData?.image || "");

    if (hasChanges) {
      const result = await Swal.fire({
        title: t("confirmCancel"),
        text: t("confirmCancel") ,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6b7280",
        cancelButtonColor: "#10b981",
        confirmButtonText: t("common.cancel"),
        cancelButtonText: t("common.save") || "Save Changes",
      });

      if (result.isConfirmed) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: t("confirmDelete"),
      text: t("confirmDelete") ,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("yesDeleteIt") || "Yes, Delete It!",
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      Swal.fire({
        title: t("categoryDeleted"),
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1000,
      });

      setTimeout(() => {
        router.push("/admin/categories");
      }, 1000);

    } catch (error) {
      Swal.fire({
        title: t("common.error"),
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const hasChanges = 
    name !== originalData?.name || 
    slug !== originalData?.slug || 
    image !== (originalData?.image || "");

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaLayerGroup className="text-primary" />
            <span>...{t("common.loading")}</span>
          </div>
          <p className="text-gray-500 mt-2">{t("pleaseWait") || "Please wait while we fetch category details"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel}
              className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning rounded-2xl shadow-lg">
                <FaEdit className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{t("editCategory")}</h1>
                <p className="text-gray-600 mt-1">{t("updateCategoryInfo") || "Update your product category information"}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="btn btn-error btn-outline flex items-center gap-2"
          >
            <FaTrash />
            {t("common.delete")}
          </button>
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
                className={`input input-bordered rounded-lg input-primary w-full text-lg py-3 ${isRTL ? 'text-right' : 'text-left'}`}
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("enterSlug")}
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className={`input input-bordered rounded-lg input-primary w-full text-lg py-3 font-mono ${isRTL ? 'text-right' : 'text-left'}`}
                  required
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setSlug(generateSlug(name))}
                  className="btn rounded-lg btn-outline btn-primary tooltip"
                  data-tip={t("regenerateFromName") || "Regenerate from name"}
                >
                  <FaSync className="text-lg" />
                </button>
              </div>
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
                <span className="text-gray-400">({t("optional")})</span>
              </label>
              <input
                type="url"
                placeholder={t("enterImageUrl")}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={`input input-bordered rounded-lg input-primary w-full text-md py-3 ${isRTL ? 'text-right' : 'text-left'}`}
              />
              
              {/* Image Preview */}
              {image && (
                <div className="mt-6 p-6 border-2 border-dashed border-info/50 rounded-xl bg-gradient-to-br from-info/5 to-info/10 hover:border-info/70 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-info/20 rounded-full">
                      <FaEye className="text-info text-lg" />
                    </div>
                    <h4 className="font-bold text-info text-lg">{t("imagePreview")}</h4>
                  </div>

                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    {/* Image Display */}
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <Image
                          src={image}
                          alt={t("imagePreview")}
                          width={120}
                          height={120}
                          className="w-32 h-32 object-cover rounded-xl bg-white shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300"></div>
                      </div>
                    </div>

                    {/* Image Details */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">{t("imageUrl")}:</span>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-gray-200">
                          <p className="text-sm font-mono break-all text-gray-800 leading-relaxed">{image}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <span>{t("livePreview")}</span>
                        </div>
                      </div>
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
                className="btn flex-1 text-lg py-3"
                disabled={loading}
              >
                {t("common.cancel")}
              </button>
              
              <button
                type="submit"
                className="btn btn-warning flex-1 text-lg py-3 flex items-center gap-2"
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {t("common.submitting")}...
                  </>
                ) : (
                  <>
                    <FaSave />
                    {t("updateCategory")}
                  </>
                )}
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-warning text-sm font-semibold flex items-center gap-2">
                  <FaEdit />
                  {t("unsavedChanges") || "You have unsaved changes"}
                </p>
              </div>
            )}
          </form>

          {/* Category Information */}
          {originalData && (
            <div className="mt-8 p-4 bg-base-200 rounded-lg border border-base-300">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaLayerGroup className="text-primary" />
                {t("categoryInfo")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">{t("created")}:</span>
                  <p className="text-gray-500">
                    {new Date(originalData.createdAt).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">{t("lastUpdated")}:</span>
                  <p className="text-gray-500">
                    {new Date(originalData.updatedAt).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-600">{t("categoryId")}:</span>
                  <p className="text-gray-500 font-mono text-xs">{id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
