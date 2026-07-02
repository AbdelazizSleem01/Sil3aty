// app/admin/create-brands/[id]/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { 
  FaEdit, 
  FaSpinner, 
  FaImage, 
  FaSave,
  FaArrowLeft,
  FaTag,
  FaFileAlt,
  FaTrash
} from "react-icons/fa";
import { compressImage } from "../../../../../lib/imageCompressor";

export default function BrandDetailPage({ params }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { id } = React.use(params);
  const [brand, setBrand] = useState({ name: "", description: "", logo: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBrand();
  }, [id]);

  const fetchBrand = async () => {
    try {
      const response = await fetch(`/api/brands/${id}`);
      if (!response.ok) {
        throw new Error(t("createBrand.loadingDetails") + " failed");
      }
      const data = await response.json();
      setBrand(data);
      setPreviewUrl(data.logo || "");
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t("createBrand.validImageError"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("createBrand.sizeImageError"));
        return;
      }
      
      try {
        toast.info(t("createBrand.optimizeMsg"));
        const compressed = await compressImage(file, 400, 400, 0.7);
        setLogoFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
        toast.success(t("createBrand.optimizeSuccess"));
      } catch (err) {
        setLogoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const removeLogo = (e) => {
    e.stopPropagation();
    setLogoFile(null);
    setPreviewUrl("");
    setBrand(prev => ({ ...prev, logo: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!brand.name.trim() || !brand.description.trim()) {
      toast.error(t("createBrand.requiredFieldsError"));
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", brand.name.trim());
      formData.append("description", brand.description.trim());

      if (logoFile) {
        formData.append("logo", logoFile);
      } else if (!previewUrl) {
        formData.append("removeLogo", "true");
      }

      const response = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update brand");
      }

      toast.success(`🎉 ${t("createBrand.successUpdate")}`);
      
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1500);

    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!confirm(t("createBrand.confirmDelete"))) {
      return;
    }

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      toast.success(`🗑️ ${t("createBrand.successDelete")}`);
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1000);

    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-6xl text-primary animate-spin" />
          <p className="text-xl text-gray-600">{t("createBrand.loadingDetails")}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen p-8 bg-gradient-to-br from-base-100 to-base-200 ${isRTL ? "font-arabic" : ""}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel}
              className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
            >
              <FaArrowLeft className={`text-lg ${isRTL ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center gap-3">
              <FaEdit className="text-3xl text-primary" />
              <h1 className="text-3xl font-bold text-gray-800">{t("createBrand.editBrand")}</h1>
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="btn btn-error btn-outline flex items-center gap-2"
          >
            <FaTrash />
            {t("createBrand.deleteBrand")}
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300"
        >
          {/* Name Field */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <FaTag className="text-primary" />
              <span className="text-lg font-semibold text-gray-700">{t("createBrand.brandName")}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              className="input input-bordered input-primary w-full text-lg py-3"
              placeholder={t("createBrand.enterBrandName")}
              required
              maxLength={100}
            />
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <FaFileAlt className="text-primary" />
              <span className="text-lg font-semibold text-gray-700">{t("createBrand.description")}</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={brand.description}
              onChange={(e) => setBrand({ ...brand, description: e.target.value })}
              className="textarea textarea-bordered textarea-primary w-full text-lg py-3 min-h-32"
              placeholder={t("createBrand.enterBrandDesc")}
              required
              maxLength={500}
            />
            <div className={`text-${isRTL ? "left" : "right"} text-sm text-gray-500 mt-1`}>
              {brand.description.length}/500
            </div>
          </div>

          {/* Logo Upload Field */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <FaImage className="text-primary text-lg" />
              <span className="text-lg font-semibold text-gray-700">{t("createBrand.brandLogo")}</span>
              <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-6 bg-base-50 hover:bg-base-100 transition-colors relative group min-h-[200px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {previewUrl ? (
                <div className="relative w-full flex flex-col items-center z-20">
                  <img
                    src={previewUrl}
                    alt="Brand logo preview"
                    className="w-full max-w-[200px] h-32 object-contain rounded-xl bg-white p-3 shadow-md border border-base-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="mt-3 btn btn-sm btn-error btn-outline"
                  >
                    {t("createBrand.removeLogo")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 py-4">
                  <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <FaImage className="text-3xl" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    {t("createBrand.clickDragUpload")}
                  </span>
                  <span className="text-sm text-gray-400">
                    PNG, JPG, WEBP (Max 5MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost flex-1"
              disabled={uploading}
            >
              {t("createBrand.cancel")}
            </button>
            
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {t("createBrand.updatingBrand")}
                </>
              ) : (
                <>
                  <FaSave />
                  {t("createBrand.saveChanges")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
