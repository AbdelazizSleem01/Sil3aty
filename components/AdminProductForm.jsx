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
  Image,
  FileText,
  Save,
  Plus,
  X,
  Upload,
  Camera,
  ChevronUp,
  ChevronDown,
  Crown,
} from "lucide-react";
import SimpleEditor from "./SimpleEditor";

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

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to save product: ${response.status}`
        );
      }

      const result = await response.json();

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
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-8 bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {product ? (isRTL ? t("editProduct_ar") || t("editProduct") : t("editProduct")) || "Edit Product" : (isRTL ? t("createNewProduct_ar") || t("createNewProduct") : t("createNewProduct")) || "Create New Product"}
              </h2>
              <p className="text-emerald-100">
                {product
                  ? (isRTL ? t("updateProductInformation_ar") || t("updateProductInformation") : t("updateProductInformation")) || "Update product information"
                  : (isRTL ? t("addNewProductToStore_ar") || t("addNewProductToStore") : t("addNewProductToStore")) || "Add a new product to your store"}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-ghost btn-sm text-white hover:bg-white/20 rounded-full p-2"
              title={isRTL ? t("close_ar") || t("close") : t("close")}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            {/* Product Basics Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isRTL ? t("productBasics_ar") || t("productBasics") : t("productBasics")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {isRTL ? t("productName_ar") || t("productName") : t("productName")} *
                    </span>
                  </label>
                  <input
                    {...register("name", {
                      required: isRTL ? t("productNameRequired_ar") || t("productNameRequired") : t("productNameRequired"),
                    })}
                    className="input input-bordered w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    placeholder={isRTL ? t("enterProductName_ar") || t("enterProductName") : t("enterProductName")}
                  />
                  {errors.name && (
                    <span className="text-error text-sm flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" />
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Slug *
                    </span>
                  </label>
                  <input
                    {...register("slug", {
                      required: isRTL ? t("slugRequired_ar") || t("slugRequired") : t("slugRequired"),
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message:
                          "Slug must be lowercase letters, numbers, and hyphens",
                      },
                    })}
                    className="input input-bordered w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder={isRTL ? t("enterSlug_ar") || t("enterSlug") : t("enterSlug")}
                  />
                  {errors.slug && (
                    <span className="text-error text-sm flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" />
                      {errors.slug.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">
                        {isRTL ? t("category_ar") || t("category") : t("category")} *
                      </span>
                    </label>
                    <select
                      {...register("category", {
                        required: isRTL ? t("categoryRequired_ar") || t("categoryRequired") : t("categoryRequired"),
                      })}
                      className="select select-bordered w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="">{isRTL ? t("selectCategory_ar") || t("selectCategory") : t("selectCategory")}</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="text-error text-sm">
                        {errors.category.message}
                      </span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">
                        {isRTL ? t("brand_ar") || t("brand") : t("brand")} *
                      </span>
                    </label>
                    <select
                      {...register("brand", { required: isRTL ? t("brandRequired_ar") || t("brandRequired") : t("brandRequired") })}
                      className="select select-bordered w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="">{isRTL ? t("selectBrand_ar") || t("selectBrand") : t("selectBrand")}</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand && (
                      <span className="text-error text-sm">
                        {errors.brand.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isRTL ? t("pricingStock_ar") || t("pricingStock") : t("pricingStock")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">
                      {isRTL ? t("regularPrice_ar") || t("regularPrice") : t("regularPrice")} *
                    </span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register("price", {
                        required: "Price is required",
                        min: {
                          value: 0.5,
                          message: "Price must be at least 0.50",
                        },
                      })}
                      className="input input-bordered w-full pl-4  focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <span className="text-error text-sm">
                      {errors.price.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">
                      {isRTL ? t("salePrice_ar") || t("salePrice") : t("salePrice")}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        {...register("discountPrice", {
                          min: {
                            value: 0,
                            message: "Discount price cannot be negative",
                          },
                          validate: (value) =>
                            !value ||
                            value < watchPrice ||
                            "Discount must be less than original price",
                        })}
                        className="input input-bordered w-full pl-4  focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearDiscount}
                      className="btn btn-ghost btn-square text-gray-500 hover:text-error"
                      title="Clear discount"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.discountPrice && (
                    <span className="text-error text-sm">
                      {errors.discountPrice.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">
                      {isRTL ? t("discountPercentage_ar") || t("discountPercentage") : t("discountPercentage")}
                    </span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      {...register("discountPercentage", {
                        min: {
                          value: 0,
                          message: "Percentage cannot be negative",
                        },
                        max: {
                          value: 100,
                          message: "Percentage cannot exceed 100%",
                        },
                      })}
                      className="input input-bordered w-full pl-4  bg-gray-50"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  {errors.discountPercentage && (
                    <span className="text-error text-sm">
                      {errors.discountPercentage.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">
                        {isRTL ? t("discountStartDateOptional_ar") || t("discountStartDateOptional") : t("discountStartDateOptional")}
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("discountStartDate")}
                      className="input input-bordered w-full focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">
                        {isRTL ? t("discountEndDateOptional_ar") || t("discountEndDateOptional") : t("discountEndDateOptional")}
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("discountEndDate")}
                      className="input input-bordered w-full focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">
                      {isRTL ? t("stockQuantity_ar") || t("stockQuantity") : t("stockQuantity")} *
                    </span>
                  </label>
                  <input
                    type="number"
                    {...register("countInStock", {
                      required: "Stock quantity is required",
                      min: { value: 0, message: "Stock cannot be negative" },
                    })}
                    className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder="0"
                  />
                  {errors.countInStock && (
                    <span className="text-error text-sm">
                      {errors.countInStock.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Attributes Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Palette className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isRTL ? t("productAttributes_ar") || t("productAttributes") : t("productAttributes")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      {isRTL ? t("sizes_ar") || t("sizes") : t("sizes")}
                    </span>
                  </label>
                  <input
                    {...register("sizes")}
                    className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder={isRTL ? t("sizePlaceholder_ar") || t("sizePlaceholder") : t("sizePlaceholder")}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      {isRTL ? t("colors_ar") || t("colors") : t("colors")}
                    </span>
                  </label>
                  <input
                    {...register("colors")}
                    className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder={isRTL ? t("colorPlaceholder_ar") || t("colorPlaceholder") : t("colorPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="toggle toggle-primary"
                      />
                      <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        {isRTL ? t("featured_ar") || t("featured") : t("featured")}
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                      <input
                        type="checkbox"
                        {...register("isOnSale")}
                        className="toggle toggle-warning"
                      />
                      <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {isRTL ? t("onSale_ar") || t("onSale") : t("onSale")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 ">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Image className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
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
                <div className="form-control h-full">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="btn btn-outline btn-lg w-full h-full border-dashed border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {isRTL ? t("clickToUploadImages_ar") || t("clickToUploadImages") : t("clickToUploadImages")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isRTL ? t("orDragAndDrop_ar") || t("orDragAndDrop") : t("orDragAndDrop")}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col ">
                  <div className="flex justify-between items-center mb-4">
                    <label className="label p-0">
                      <span className="label-text font-medium text-gray-700">
                        {isRTL ? t("imagePreview_ar") || t("imagePreview") : t("imagePreview")}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="btn btn-sm btn-outline btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {isRTL ? t("addMoreImages_ar") || t("addMoreImages") : t("addMoreImages")}
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div
                            className={`relative bg-gray-50 h-56 rounded-lg overflow-hidden ${
                              mainImage === image
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            }`}
                          >
                            <img
                              loading="lazy"
                              src={
                                typeof image === "string"
                                  ? image
                                  : URL.createObjectURL(image)
                              }
                              alt={`Product Image ${index + 1}`}
                              className="w-full h-56 object-cover"
                            />

                            {mainImage === image && (
                              <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                                <Crown className="w-3 h-3" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setMainImageHandler(image)}
                                className={`btn btn-circle btn-sm ${
                                  mainImage === image
                                    ? "btn-primary"
                                    : "btn-secondary"
                                }`}
                                title="Set as main image"
                              >
                                <Crown className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => moveImageUp(index)}
                                disabled={index === 0}
                                className="btn btn-circle btn-sm btn-secondary disabled:opacity-50"
                                title="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>

                              {/* Move down */}
                              <button
                                type="button"
                                onClick={() => moveImageDown(index)}
                                disabled={index === images.length - 1}
                                className="btn btn-circle btn-sm btn-secondary disabled:opacity-50"
                                title="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="btn btn-circle btn-sm btn-error"
                                title="Delete image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="text-center mt-2">
                            <p className="text-xs text-gray-500">
                              Image {index + 1}
                              {mainImage === image && (
                                <span className="ml-1 text-primary font-semibold">
                                  (Main)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                      {images.length} {isRTL ? t("imagesSelected_ar") || t("imagesSelected") : t("imagesSelected")}
                    </p>
                    {images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="btn btn-sm btn-ghost text-error hover:bg-error hover:text-error-content"
                      >
                        {isRTL ? t("removeAll_ar") || t("removeAll") : t("removeAll")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Description Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isRTL ? t("description_ar") || t("description") : t("description")}
                </h3>
              </div>

              <div className="form-control">
                <SimpleEditor
                  value={watch("description") ?? ""}
                  onChange={(value) => setValue("description", value)}
                />
                {errors.description && (
                  <span className="text-error text-sm flex items-center gap-1 mt-1">
                    <X className="w-3 h-3" />
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-control mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-lg w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border-none text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {product ? (isRTL ? t("updatingProduct_ar") || t("updatingProduct") : t("updatingProduct")) : (isRTL ? t("creatingProduct_ar") || t("creatingProduct") : t("creatingProduct"))}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {product ? (isRTL ? t("updateProduct_ar") || t("updateProduct") : t("updateProduct")) : (isRTL ? t("createProduct_ar") || t("createProduct") : t("createProduct"))}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
