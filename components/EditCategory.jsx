"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState(null);

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
        
        toast.success("Category loaded successfully!");
      } catch (err) {
        toast.error(`❌ ${err.message}`);
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
    
    // Auto-generate slug from name if slug is empty or matches the original name
    if (newName && (!slug || slug === generateSlug(originalData?.name))) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      toast.error("Please fill in all required fields");
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

      toast.success("🎉 Category updated successfully!");
      
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
    const hasChanges = 
      name !== originalData?.name || 
      slug !== originalData?.slug || 
      image !== (originalData?.image || "");

    if (hasChanges) {
      if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("🗑️ Category deleted successfully!");
      
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1000);

    } catch (error) {
      toast.error(`❌ ${error.message}`);
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
            <span>Loading Category...</span>
          </div>
          <p className="text-gray-500 mt-2">Please wait while we fetch category details</p>
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
                <h1 className="text-3xl font-bold text-gray-800">Edit Category</h1>
                <p className="text-gray-600 mt-1">Update your product category information</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="btn btn-error btn-outline flex items-center gap-2"
          >
            <FaTrash />
            Delete
          </button>
        </div>

        {/* Form */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaTag className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">Category Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Electronics, Clothing, Home Decor"
                value={name}
                onChange={handleNameChange}
                className="input input-bordered input-primary w-full text-lg py-3"
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
                <span className="label-text text-lg font-semibold text-gray-700">Slug</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., electronics, clothing, home-decor"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="input input-bordered input-primary w-full text-lg py-3 font-mono"
                  required
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setSlug(generateSlug(name))}
                  className="btn btn-ghost tooltip"
                  data-tip="Regenerate from name"
                >
                  <FaSync className="text-lg" />
                </button>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>URL-friendly identifier</span>
                <span>{slug.length}/100</span>
              </div>
            </div>

            {/* Image URL */}
            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">Image URL</span>
                <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="input input-bordered input-primary w-full text-lg py-3"
              />
              
              {/* Image Preview */}
              {image && (
                <div className="mt-4 p-4 border-2 border-dashed border-info rounded-lg bg-info/10">
                  <p className="font-semibold text-info mb-2 flex items-center gap-2">
                    <FaEye />
                    Image Preview
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
                      <p className="text-xs text-gray-500 mt-1">Live preview - URL must be accessible</p>
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
                className="btn btn-ghost flex-1 text-lg py-3"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-warning flex-1 text-lg py-3 flex items-center gap-2"
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Category
                  </>
                )}
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-warning text-sm font-semibold flex items-center gap-2">
                  <FaEdit />
                  You have unsaved changes
                </p>
              </div>
            )}
          </form>

          {/* Category Info */}
          {originalData && (
            <div className="mt-8 p-4 bg-base-200 rounded-lg border border-base-300">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaLayerGroup className="text-primary" />
                Category Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Created:</span>
                  <p className="text-gray-500">
                    {new Date(originalData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Last Updated:</span>
                  <p className="text-gray-500">
                    {new Date(originalData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-600">Category ID:</span>
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