"use client";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Package,
  Tag,
  DollarSign,
  Percent,
  Hash,
  Palette,
  Ruler,
  Star,
  Zap,
  Image as ImageIcon,
  FileText,
  Save,
  Plus,
  X,
  Upload,
  ChevronUp,
  ChevronDown,
  Crown,
  Eye,
  Sliders,
  Calendar,
  Layers
} from "lucide-react";
import SimpleEditor from "./SimpleEditor";
import axios from "axios";

export default function AdminProductForm({ product, onSuccess, onCancel }) {
  const { data: session, status } = useSession();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!product);
  const [images, setImages] = useState(product?.images || []);
  const [mainImage, setMainImage] = useState(product?.mainImage || null);
  const fileInputRef = useRef(null);
  const isRTL = i18n.language === "ar";
  const [uploadProgress, setUploadProgress] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: product || {
      name: "",
      slug: "",
      category: "",
      images: [],
      price: 0,
      discountPrice: "",
      discountPercentage: "",
      discountStartDate: "",
      discountEndDate: "",
      brand: "",
      description: "",
      sizes: [],
      colors: [],
      countInStock: 0,
      isFeatured: false,
      isOnSale: false,
      banner: "",
    },
  });

  const watchPrice = watch("price");
  const watchDiscountPrice = watch("discountPrice");

  useEffect(() => {
    if (watchPrice && watchDiscountPrice) {
      const price = parseFloat(watchPrice);
      const discountPrice = parseFloat(watchDiscountPrice);

      if (price > 0 && discountPrice > 0 && discountPrice < price) {
        const percentage = Math.round(((price - discountPrice) / price) * 100);
        setValue("discountPercentage", percentage);
        setValue("isOnSale", true);
      }
    }
  }, [watchPrice, watchDiscountPrice, setValue]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (product && product._id) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/products/${product._id}`);
          if (!response.ok) throw new Error("Failed to fetch product details");

          const productData = await response.json();

          Object.entries(productData).forEach(([key, value]) => {
            setValue(key, value);
          });

          if (productData.brand && typeof productData.brand === "object") {
            setValue("brand", productData.brand._id);
          }

          if (
            productData.category &&
            typeof productData.category === "object"
          ) {
            setValue("category", productData.category._id);
          }

          setImages(productData.images || []);
          setIsLoading(false);
        } catch (error) {
          toast.error("❌ Failed to load product details");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [product, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/category");
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data);
    } catch (error) {}
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("category", data.category);
      formData.append("brand", data.brand);
      formData.append("price", data.price.toString());
      formData.append("description", data.description);
      formData.append("countInStock", data.countInStock.toString());
      formData.append("isFeatured", data.isFeatured.toString());
      formData.append("isOnSale", data.isOnSale.toString());

      if (data.sizes) {
        formData.append(
          "sizes",
          Array.isArray(data.sizes) ? data.sizes.join(",") : data.sizes
        );
      } else {
        formData.append("sizes", "");
      }

      if (data.colors) {
        formData.append(
          "colors",
          Array.isArray(data.colors) ? data.colors.join(",") : data.colors
        );
      } else {
        formData.append("colors", "");
      }

      if (data.discountPrice) {
        formData.append("discountPrice", data.discountPrice.toString());
      } else {
        formData.append("discountPrice", "");
      }

      if (data.discountPercentage) {
        formData.append(
          "discountPercentage",
          data.discountPercentage.toString()
        );
      } else {
        formData.append("discountPercentage", "");
      }

      if (data.discountStartDate) {
        formData.append("discountStartDate", data.discountStartDate);
      }
      if (data.discountEndDate) {
        formData.append("discountEndDate", data.discountEndDate);
      }

      const existingImages = images.filter((img) => typeof img === "string");
      const newImages = images.filter((img) => img instanceof File);

      if (existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      newImages.forEach((file) => {
        formData.append("images", file);
      });

      if (mainImage && typeof mainImage === "string") {
        formData.append("mainImage", mainImage);
      }

      setUploadProgress(0);

      const response = await axios({
        url,
        method,
        data: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast.success(`Product ${product ? "updated" : "created"} successfully`);
      onSuccess();

      if (!product) {
        reset();
        setImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearDiscount = () => {
    setValue("discountPrice", "");
    setValue("discountPercentage", "");
    setValue("isOnSale", false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const moveImageUp = (index) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      setImages(newImages);

      if (mainImage === images[index]) {
        setMainImage(newImages[index - 1]);
      } else if (mainImage === images[index - 1]) {
        setMainImage(newImages[index]);
      }
    }
  };

  const moveImageDown = (index) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      setImages(newImages);

      if (mainImage === images[index]) {
        setMainImage(newImages[index + 1]);
      } else if (mainImage === images[index + 1]) {
        setMainImage(newImages[index]);
      }
    }
  };

  const setMainImageHandler = (image) => {
    setMainImage(image);
  };

  useEffect(() => {
    if (images.length > 0 && !mainImage) {
      setMainImage(images[0]);
    }
  }, [images, mainImage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-base-100 rounded-3xl border border-base-300">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
        <p className="mt-4 text-gray-500 font-semibold">{isRTL ? "جاري تحميل بيانات المنتج..." : "Loading product details..."}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-8 bg-base-100 rounded-3xl border border-base-300 shadow-xl overflow-hidden animate-fade-in"
    >
      {/* Premium Form Header */}
      <div className="bg-gradient-to-r from-primary to-primary-focus p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {product 
                  ? (isRTL ? t("editProduct_ar") || t("editProduct") : t("editProduct")) 
                  : (isRTL ? t("createNewProduct_ar") || t("createNewProduct") : t("createNewProduct"))}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {product
                  ? (isRTL ? t("updateProductInformation_ar") || t("updateProductInformation") : t("updateProductInformation"))
                  : (isRTL ? t("addNewProductToStore_ar") || t("addNewProductToStore") : t("addNewProductToStore"))}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost btn-circle text-white hover:bg-white/20"
              title={isRTL ? t("close_ar") || t("close") : t("close")}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* ==================== LEFT COLUMN ==================== */}
          <div className="space-y-8">
            
            {/* Product Basics Section */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-base-200">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isRTL ? t("productBasics_ar") || t("productBasics") : t("productBasics")}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm">
                    <span>{isRTL ? t("productName_ar") || t("productName") : t("productName")} *</span>
                  </label>
                  <input
                    {...register("name", {
                      required: isRTL ? t("productNameRequired_ar") || t("productNameRequired") : t("productNameRequired"),
                    })}
                    className="input input-bordered w-full rounded-xl focus:ring-primary focus:border-primary"
                    placeholder={isRTL ? t("enterProductName_ar") || t("enterProductName") : t("enterProductName")}
                  />
                  {errors.name && (
                    <span className="text-error text-xs flex items-center gap-1 mt-1 font-medium">
                      <X className="w-3.5 h-3.5" />
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Slug */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm">
                    <span>{isRTL ? "الرابط المختصر (Slug) *" : "Slug *"}</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("slug", {
                        required: isRTL ? t("slugRequired_ar") || t("slugRequired") : t("slugRequired"),
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: "Slug must be lowercase letters, numbers, and hyphens",
                        },
                      })}
                      className="input input-bordered w-full rounded-xl pl-12 font-mono"
                      placeholder={isRTL ? t("enterSlug_ar") || t("enterSlug") : t("enterSlug")}
                    />
                    <Hash className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.slug && (
                    <span className="text-error text-xs flex items-center gap-1 mt-1 font-medium">
                      <X className="w-3.5 h-3.5" />
                      {errors.slug.message}
                    </span>
                  )}
                </div>

                {/* Category & Brand dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("category_ar") || t("category") : t("category")} *</span>
                    </label>
                    <select
                      {...register("category", {
                        required: isRTL ? t("categoryRequired_ar") || t("categoryRequired") : t("categoryRequired"),
                      })}
                      className="select select-bordered w-full rounded-xl"
                    >
                      <option value="">{isRTL ? t("selectCategory_ar") || t("selectCategory") : t("selectCategory")}</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="text-error text-xs mt-1 font-medium">{errors.category.message}</span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("brand_ar") || t("brand") : t("brand")} *</span>
                    </label>
                    <select
                      {...register("brand", { 
                        required: isRTL ? t("brandRequired_ar") || t("brandRequired") : t("brandRequired") 
                      })}
                      className="select select-bordered w-full rounded-xl"
                    >
                      <option value="">{isRTL ? t("selectBrand_ar") || t("selectBrand") : t("selectBrand")}</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand && (
                      <span className="text-error text-xs mt-1 font-medium">{errors.brand.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock Section */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-base-200">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isRTL ? t("pricingStock_ar") || t("pricingStock") : t("pricingStock")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular Price */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("regularPrice_ar") || t("regularPrice") : t("regularPrice")} *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        {...register("price", {
                          required: "Price is required",
                          min: {
                            value: 0.5,
                            message: "Price must be at least 0.50",
                          },
                        })}
                        className="input input-bordered w-full pl-12 rounded-xl"
                        placeholder="0.00"
                      />
                      <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.price && (
                      <span className="text-error text-xs mt-1 font-medium">{errors.price.message}</span>
                    )}
                  </div>

                  {/* Sale Price */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("salePrice_ar") || t("salePrice") : t("salePrice")}</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          {...register("discountPrice", {
                            min: {
                              value: 0,
                              message: "Discount price cannot be negative",
                            },
                            validate: (value) =>
                              !value ||
                              parseFloat(value) < parseFloat(watchPrice) ||
                              "Discount must be less than original price",
                          })}
                          className="input input-bordered w-full pl-12 rounded-xl"
                          placeholder="0.00"
                        />
                        <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                      {(watchDiscountPrice || watchDiscountPrice === 0) && (
                        <button
                          type="button"
                          onClick={clearDiscount}
                          className="btn btn-ghost btn-circle text-gray-400 hover:text-error"
                          title="Clear discount"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {errors.discountPrice && (
                      <span className="text-error text-xs mt-1 font-medium">{errors.discountPrice.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discount percentage */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("discountPercentage_ar") || t("discountPercentage") : t("discountPercentage")}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register("discountPercentage", {
                          min: { value: 0, message: "Percentage cannot be negative" },
                          max: { value: 100, message: "Percentage cannot exceed 100%" },
                        })}
                        className="input input-bordered w-full pl-12 bg-base-200 rounded-xl"
                        placeholder="0"
                        readOnly
                      />
                      <Percent className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("stockQuantity_ar") || t("stockQuantity") : t("stockQuantity")} *</span>
                    </label>
                    <input
                      type="number"
                      {...register("countInStock", {
                        required: "Stock quantity is required",
                        min: { value: 0, message: "Stock cannot be negative" },
                      })}
                      className="input input-bordered w-full rounded-xl"
                      placeholder="0"
                    />
                    {errors.countInStock && (
                      <span className="text-error text-xs mt-1 font-medium">{errors.countInStock.message}</span>
                    )}
                  </div>
                </div>

                {/* Discount Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("discountStartDateOptional_ar") || t("discountStartDateOptional") : t("discountStartDateOptional")}</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("discountStartDate")}
                      className="input input-bordered w-full rounded-xl"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{isRTL ? t("discountEndDateOptional_ar") || t("discountEndDateOptional") : t("discountEndDateOptional")}</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("discountEndDate")}
                      className="input input-bordered w-full rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN ==================== */}
          <div className="space-y-8">
            
            {/* Attributes & Features Section */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-base-200">
                <Sliders className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isRTL ? t("productAttributes_ar") || t("productAttributes") : t("productAttributes")}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Sizes Input */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm">
                    <span>{isRTL ? t("sizes_ar") || t("sizes") : t("sizes")}</span>
                  </label>
                  <input
                    {...register("sizes")}
                    className="input input-bordered w-full rounded-xl"
                    placeholder={isRTL ? t("sizePlaceholder_ar") || t("sizePlaceholder") : t("sizePlaceholder")}
                  />
                </div>

                {/* Colors Input */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm">
                    <span>{isRTL ? t("colors_ar") || t("colors") : t("colors")}</span>
                  </label>
                  <input
                    {...register("colors")}
                    className="input input-bordered w-full rounded-xl"
                    placeholder={isRTL ? t("colorPlaceholder_ar") || t("colorPlaceholder") : t("colorPlaceholder")}
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="form-control p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <label className="label cursor-pointer flex items-center justify-between p-0">
                      <span className="font-bold text-primary text-sm flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-primary" />
                        {isRTL ? t("featured_ar") || t("featured") : t("featured")}
                      </span>
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="toggle toggle-primary toggle-sm"
                      />
                    </label>
                  </div>

                  <div className="form-control p-4 bg-warning/5 rounded-2xl border border-warning/10">
                    <label className="label cursor-pointer flex items-center justify-between p-0">
                      <span className="font-bold text-warning-content text-sm flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        {isRTL ? t("onSale_ar") || t("onSale") : t("onSale")}
                      </span>
                      <input
                        type="checkbox"
                        {...register("isOnSale")}
                        className="toggle toggle-warning toggle-sm"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-base-200">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isRTL ? t("productImages_ar") || t("productImages") : t("productImages")}
                </h3>
              </div>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />

              {images.length === 0 ? (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 rounded-2xl transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2 group-hover:text-primary" />
                  <span className="font-bold text-gray-700 text-sm">
                    {isRTL ? t("clickToUploadImages_ar") || t("clickToUploadImages") : t("clickToUploadImages")}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {isRTL ? t("orDragAndDrop_ar") || t("orDragAndDrop") : t("orDragAndDrop")}
                  </span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-base-50 p-2.5 rounded-xl border border-base-300">
                    <span className="text-xs font-semibold text-gray-500">
                      {images.length} {isRTL ? t("imagesSelected_ar") || t("imagesSelected") : t("imagesSelected")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="btn btn-xs btn-outline btn-primary rounded-lg"
                      >
                        {isRTL ? "إضافة" : "Add More"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="btn btn-xs btn-ghost text-error rounded-lg"
                      >
                        {isRTL ? t("removeAll_ar") || t("removeAll") : t("removeAll")}
                      </button>
                    </div>
                  </div>

                  {/* Previews grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                    {images.map((image, index) => {
                      const isMain = mainImage === image;
                      const imageUrl = typeof image === "string" ? image : URL.createObjectURL(image);

                      return (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-base-300 group shadow-sm bg-base-200">
                          <img
                            loading="lazy"
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {isMain && (
                            <div className="absolute top-2.5 right-2.5 bg-primary text-white p-1 rounded-lg shadow" title="Main Image">
                              <Crown className="w-3.5 h-3.5 fill-white" />
                            </div>
                          )}

                          {/* Quick controls overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                            <button
                              type="button"
                              onClick={() => setMainImageHandler(image)}
                              className={`btn btn-square btn-xs ${isMain ? "btn-primary" : "btn-neutral text-white"}`}
                              title={isRTL ? "الأساسية" : "Set Main"}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImageUp(index)}
                              disabled={index === 0}
                              className="btn btn-square btn-xs btn-neutral text-white disabled:opacity-40"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImageDown(index)}
                              disabled={index === images.length - 1}
                              className="btn btn-square btn-xs btn-neutral text-white disabled:opacity-40"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="btn btn-square btn-xs btn-error text-white"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 md:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-base-200">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">
              {isRTL ? t("description_ar") || t("description") : t("description")}
            </h3>
          </div>

          <div className="form-control">
            <SimpleEditor
              value={watch("description") ?? ""}
              onChange={(value) => setValue("description", value)}
            />
            {errors.description && (
              <span className="text-error text-xs flex items-center gap-1 mt-1.5 font-medium">
                <X className="w-3.5 h-3.5" />
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        {/* Form Actions bar */}
        <div className="flex gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-lg btn-ghost flex-1 rounded-xl"
            >
              {t("cancel") || "Cancel"}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-lg btn-primary flex-[2] shadow-lg hover:shadow-xl rounded-xl gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-md"></span>
                <span>{product 
                  ? (isRTL ? t("updatingProduct_ar") || t("updatingProduct") : t("updatingProduct")) 
                  : (isRTL ? t("creatingProduct_ar") || t("creatingProduct") : t("creatingProduct"))}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{product 
                  ? (isRTL ? t("updateProduct_ar") || t("updateProduct") : t("updateProduct")) 
                  : (isRTL ? t("createProduct_ar") || t("createProduct") : t("createProduct"))}</span>
              </>
            )}
          </button>
        </div>
        {/* Upload Progress Overlay */}
        {isSubmitting && uploadProgress !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-base-100 border border-base-300 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
              <span className="loading loading-spinner text-primary w-12 h-12"></span>
              <div className="space-y-1.5">
                <h3 className="font-bold text-gray-800 text-lg">
                  {isRTL ? "جاري رفع المنتجات والصور..." : "Uploading Product & Images..."}
                </h3>
                <p className="text-sm text-gray-400">
                  {isRTL ? "الرجاء عدم إغلاق هذه الصفحة" : "Please do not close this page"}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 font-semibold">
                  <span>{isRTL ? "تقدم الرفع" : "Upload Progress"}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full h-2 rounded-full" 
                  value={uploadProgress} 
                  max="100" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
