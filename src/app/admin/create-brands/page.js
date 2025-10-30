"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { 
  FaPlus, 
  FaSpinner, 
  FaUpload, 
  FaImage, 
  FaSave,
  FaArrowLeft,
  FaTag,
  FaFileAlt
} from "react-icons/fa";

export default function NewBrandPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brand, setBrand] = useState({ name: "", description: "", logo: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

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
      toast.info("Logo selected successfully");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!brand.name.trim() || !brand.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!logoFile) {
      toast.error("Please select a logo image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", brand.name.trim());
      formData.append("description", brand.description.trim());

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch("/api/brands", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create brand");
      }

      const data = await response.json();
      toast.success("🎉 Brand created successfully!");
      
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1500);

    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (brand.name || brand.description || logoFile) {
      if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex items-center gap-3">
            <FaPlus className="text-3xl text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Add New Brand</h1>
          </div>
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
              <span className="text-red-500">*</span>
            </label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2">
                <FaUpload />
                Choose Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
              
              <span className="text-sm text-gray-500">
                PNG, JPG, WEBP up to 5MB
              </span>
            </div>

            {/* Image Preview */}
            {logoFile && (
              <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                <div className="flex items-center gap-4">
                  <img
                    loading="lazy"
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="w-20 h-20 object-contain bg-white rounded-lg p-2 shadow-md"
                  />
                  <div>
                    <p className="font-semibold text-success">Logo Selected</p>
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
              className="btn flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating Brand...
                </>
              ) : (
                <>
                  <FaSave />
                  Create Brand
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
