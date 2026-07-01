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
import { compressImage } from "../../../../lib/imageCompressor";

export default function NewBrandPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brand, setBrand] = useState({ name: "", description: "", logo: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      
      try {
        toast.info("Optimizing logo image...");
        const compressed = await compressImage(file, 400, 400, 0.7);
        setLogoFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
        toast.success("Logo optimized successfully");
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
              <FaImage className="text-primary text-lg" />
              <span className="text-lg font-semibold text-gray-700">Brand Logo</span>
              <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-6 bg-base-50 hover:bg-base-100 transition-colors relative group min-h-[200px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required={!logoFile}
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
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 py-4">
                  <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <FaImage className="text-3xl" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Click or drag to upload brand logo
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
