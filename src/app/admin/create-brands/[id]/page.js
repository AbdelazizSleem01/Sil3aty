"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  FaEdit, 
  FaSpinner, 
  FaUpload, 
  FaImage, 
  FaSave,
  FaArrowLeft,
  FaTag,
  FaFileAlt,
  FaTrash,
  FaEye
} from "react-icons/fa";

export default function BrandDetailPage({ params }) {
  const { id } = React.use(params);
  const [brand, setBrand] = useState({ name: "", description: "", logo: "" });
  const [logoFile, setLogoFile] = useState(null);
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
        throw new Error("Failed to fetch brand");
      }
      const data = await response.json();
      setBrand(data);
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setLogoFile(file);
      toast.info("New logo selected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!brand.name.trim() || !brand.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", brand.name.trim());
      formData.append("description", brand.description.trim());

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update brand");
      }

      const data = await response.json();
      toast.success("🎉 Brand updated successfully!");
      
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
    if (brand.name !== brand.originalName || brand.description !== brand.originalDescription || logoFile) {
      if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this brand? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      toast.success("🗑️ Brand deleted successfully!");
      setTimeout(() => {
        router.push("/brands");
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
          <p className="text-xl text-gray-600">Loading brand details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-2xl mx-auto">
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
              <FaEdit className="text-3xl text-primary" />
              <h1 className="text-3xl font-bold text-gray-800">Edit Brand</h1>
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="btn btn-error btn-outline flex items-center gap-2"
          >
            <FaTrash />
            Delete Brand
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
              <span className="text-lg font-semibold text-gray-700">Brand Name</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              className="input input-bordered input-primary w-full text-lg py-3"
              placeholder="Enter brand name"
              required
              maxLength={100}
            />
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <FaFileAlt className="text-primary" />
              <span className="text-lg font-semibold text-gray-700">Description</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={brand.description}
              onChange={(e) => setBrand({ ...brand, description: e.target.value })}
              className="textarea textarea-bordered textarea-primary w-full text-lg py-3 min-h-32"
              placeholder="Enter brand description"
              required
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {brand.description.length}/500
            </div>
          </div>

          {/* Logo Upload Field */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <FaImage className="text-primary" />
              <span className="text-lg font-semibold text-gray-700">Brand Logo</span>
            </label>
            
            {/* Current Logo */}
            {brand.logo && (
              <div className="mb-4 p-4 border-2 border-dashed border-info rounded-lg bg-info/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      loading="lazy"
                      src={brand.logo}
                      alt="Current brand logo"
                      className="w-20 h-20 object-contain bg-white rounded-lg p-2 shadow-md"
                    />
                    <div className="absolute -top-1 -right-1 bg-info text-white rounded-full p-1">
                      <FaEye className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-info">Current Logo</p>
                    <p className="text-sm text-gray-600">Click below to change</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Logo Upload */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2">
                <FaUpload />
                {brand.logo ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              
              <span className="text-sm text-gray-500">
                PNG, JPG, WEBP up to 5MB
              </span>
            </div>

            {/* New Logo Preview */}
            {logoFile && (
              <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                <div className="flex items-center gap-4">
                  <img
                    loading="lazy"
                    src={URL.createObjectURL(logoFile)}
                    alt="New logo preview"
                    className="w-20 h-20 object-contain bg-white rounded-lg p-2 shadow-md"
                  />
                  <div>
                    <p className="font-semibold text-success">New Logo Preview</p>
                    <p className="text-sm text-gray-600">{logoFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost flex-1"
              disabled={uploading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating Brand...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
