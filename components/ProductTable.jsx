"use client";
import { useState, Fragment } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  Tag, 
  Box, 
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Calendar,
  Grid,
  List,
  SlidersHorizontal,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X
} from "lucide-react";

export default function ProductTable({ products = [], onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [viewType, setViewType] = useState("card"); // "card" or "table"
  const productsPerPage = 8;
  const isRTL = i18n.language === "ar";

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'category') {
      aValue = a.category?.name;
      bValue = b.category?.name;
    } else if (sortConfig.key === 'brand') {
      aValue = a.brand?.name;
      bValue = b.brand?.name;
    }
    
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const toggleProductDetails = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const getCategoryName = (category) => {
    if (!category) return isRTL ? "غير مصنف" : "Uncategorized";
    if (typeof category === "object") return category.name;
    if (typeof category === "string") return isRTL ? "جاري التحميل..." : "Loading...";
    return isRTL ? "فئة غير صالحة" : "Invalid Category";
  };

  const getBrandName = (brand) => {
    if (!brand) return isRTL ? "بدون علامة" : "No Brand";
    if (typeof brand === "object") return brand.name;
    if (typeof brand === "string") return isRTL ? "جاري التحميل..." : "Loading...";
    return isRTL ? "علامة غير صالحة" : "Invalid Brand";
  };

  const calculateDiscountPercentage = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString(i18n.language);
    } catch {
      return "Invalid Date";
    }
  };

  const parseSizes = (sizes) => {
    if (!sizes) return [];
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === 'string') {
      return sizes.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
  };

  const parseColors = (colors) => {
    if (!colors) return [];
    if (Array.isArray(colors)) return colors;
    if (typeof colors === 'string') {
      return colors.split(',').map(c => c.trim()).filter(c => c);
    }
    return [];
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Table Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-base-100 p-4 rounded-2xl border border-base-300 gap-4 shadow-sm">
        {/* Sort selector dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{isRTL ? "ترتيب حسب:" : "Sort By:"}</span>
          <select
            value={sortConfig.key || ""}
            onChange={(e) => handleSort(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs"
          >
            <option value="">{isRTL ? "الافتراضي" : "Default"}</option>
            <option value="name">{isRTL ? "الاسم" : "Name"}</option>
            <option value="category">{isRTL ? "الفئة" : "Category"}</option>
            <option value="brand">{isRTL ? "العلامة التجارية" : "Brand"}</option>
            <option value="price">{isRTL ? "السعر" : "Price"}</option>
            <option value="countInStock">{isRTL ? "المخزون" : "Stock"}</option>
          </select>
        </div>

        {/* Layout toggle buttons */}
        <div className="join border border-base-300 rounded-xl overflow-hidden self-stretch sm:self-auto">
          <button
            onClick={() => setViewType("card")}
            className={`btn btn-sm join-item px-4 border-none h-10 ${viewType === "card" ? "btn-primary text-white" : "btn-ghost text-gray-500"}`}
            title={isRTL ? "عرض الكروت" : "Card View"}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType("table")}
            className={`btn btn-sm join-item px-4 border-none h-10 ${viewType === "table" ? "btn-primary text-white" : "btn-ghost text-gray-500"}`}
            title={isRTL ? "عرض الجدول" : "Table View"}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewType === "card" ? (
        /* ==================== CARD GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {paginatedProducts.map((product) => {
            const discountPercent = product.discountPercentage || 
              calculateDiscountPercentage(product.price, product.discountPrice);
            const hasSale = product.discountPrice && product.isOnSale;
            const isExpanded = expandedProduct === product._id;
            const sizes = parseSizes(product.sizes);
            const colors = parseColors(product.colors);

            return (
              <div 
                key={product._id} 
                className="relative bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-base-100 overflow-hidden border-b border-base-200">
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-base-50">
                      <Box className="w-12 h-12" />
                      <span className="text-xs mt-2">{isRTL ? "لا توجد صورة" : "No image"}</span>
                    </div>
                  )}

                  {/* Absolute Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {product.isFeatured && (
                      <span className="badge badge-primary text-white font-bold gap-1 px-2.5 py-1 text-[10px] shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        {isRTL ? "مميز" : "Featured"}
                      </span>
                    )}
                    {hasSale && (
                      <span className="badge badge-error text-white font-bold gap-1 px-2.5 py-1 text-[10px] shadow-sm animate-pulse">
                        <Tag className="w-3 h-3" />
                        {isRTL ? "تخفيض" : "Sale"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Category & Brand badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-ghost text-[10px] px-2 py-0.5 rounded-md font-medium text-primary bg-primary/5 uppercase">
                        {getCategoryName(product.category)}
                      </span>
                      <span className="badge badge-ghost text-[10px] px-2 py-0.5 rounded-md font-medium text-secondary bg-secondary/5 uppercase">
                        {getBrandName(product.brand)}
                      </span>
                    </div>

                    {/* Name */}
                    <Link
                      href={`/product/${product._id}`}
                      className="font-bold text-gray-800 hover:text-primary transition-colors block text-base line-clamp-1 leading-snug"
                      target="_blank"
                    >
                      {product.name}
                    </Link>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      {hasSale ? (
                        <>
                          <span className="text-lg font-black text-emerald-600">
                            ${product.discountPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            {discountPercent}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black text-gray-800">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Level indicator */}
                  <div className="pt-2 border-t border-base-200 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isRTL ? "المخزون" : "Stock"}:
                    </span>
                    {product.countInStock > 10 ? (
                      <span className="badge badge-success text-white text-[10px] gap-1 px-2 font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        {product.countInStock} {isRTL ? "متوفر" : "In Stock"}
                      </span>
                    ) : product.countInStock > 0 ? (
                      <span className="badge badge-warning text-white text-[10px] gap-1 px-2 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        {product.countInStock} {isRTL ? "متبقي قليل" : "Low Stock"}
                      </span>
                    ) : (
                      <span className="badge badge-error text-white text-[10px] gap-1 px-2 font-semibold">
                        <XCircle className="w-3 h-3" />
                        {isRTL ? "نفذ" : "Out of Stock"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Collapsible Detail Panel (Absolute Slide-Up) */}
                <div className={`absolute inset-x-0 bottom-[48px] top-0 bg-base-100/98 backdrop-blur-md p-4 text-xs transition-all duration-300 z-20 flex flex-col justify-between border-b border-base-200 overflow-y-auto ${
                  isExpanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-base-200 mb-1">
                      <span className="font-bold text-gray-800 text-sm">{isRTL ? "تفاصيل إضافية" : "Additional Info"}</span>
                      <button 
                        type="button"
                        onClick={() => toggleProductDetails(product._id)}
                        className="btn btn-ghost btn-circle btn-xs text-gray-500 hover:bg-base-200"
                        title={isRTL ? "إغلاق" : "Close"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sizes */}
                    <div>
                      <span className="font-bold text-gray-600 block mb-1">{isRTL ? "المقاسات المتاحة:" : "Available Sizes:"}</span>
                      {sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sizes.map((s, idx) => (
                            <span key={idx} className="bg-base-200 border border-base-300 text-gray-700 px-2 py-0.5 rounded font-mono text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">{isRTL ? "لا يوجد مقاسات" : "No sizes specified"}</span>
                      )}
                    </div>

                    {/* Colors */}
                    <div>
                      <span className="font-bold text-gray-600 block mb-1">{isRTL ? "الألوان المتاحة:" : "Available Colors:"}</span>
                      {colors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {colors.map((c, idx) => (
                            <span key={idx} className="bg-base-200 border border-base-300 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">{isRTL ? "لا يوجد ألوان" : "No colors specified"}</span>
                      )}
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="flex items-center gap-1.5 text-gray-400 pt-2 border-t border-base-200 text-[10px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تمت الإضافة:" : "Added:"} {formatDate(product.createdAt)}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-base-50/50 border-t border-base-200 px-4 py-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleProductDetails(product._id)}
                    className="btn btn-ghost btn-xs text-gray-500 hover:text-primary gap-1 px-2 rounded-lg"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? (isRTL ? "إخفاء التفاصيل" : "Less") : (isRTL ? "التفاصيل" : "More")}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      className="btn btn-ghost btn-xs btn-circle text-blue-600 hover:bg-blue-50"
                      title={isRTL ? "تعديل" : "Edit"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(product._id, product.name)}
                      className="btn btn-ghost btn-xs btn-circle text-red-500 hover:bg-red-50"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== TABLE LIST VIEW ==================== */
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-50">
                  <th className="font-semibold text-gray-700">{isRTL ? "المنتج" : "Product"}</th>
                  <th className="font-semibold text-gray-700">{isRTL ? "الفئة" : "Category"}</th>
                  <th className="font-semibold text-gray-700">{isRTL ? "العلامة التجارية" : "Brand"}</th>
                  <th className="font-semibold text-gray-700">{isRTL ? "السعر" : "Pricing"}</th>
                  <th className="font-semibold text-gray-700">{isRTL ? "المخزون" : "Stock"}</th>
                  <th className="font-semibold text-gray-700">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="text-center font-semibold text-gray-700">{isRTL ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-base-200">
                {paginatedProducts.map((product) => {
                  const discountPercent = product.discountPercentage || 
                    calculateDiscountPercentage(product.price, product.discountPrice);
                  const isExpanded = expandedProduct === product._id;
                  const sizes = parseSizes(product.sizes);
                  const colors = parseColors(product.colors);
                  
                  return (
                    <Fragment key={`table-row-${product._id}`}>
                      <tr className="hover:bg-base-50/50 transition-colors">
                        {/* Name & Thumbnail */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-lg bg-base-200 relative overflow-hidden border border-base-300">
                                {product.images?.length > 0 ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-base-50">
                                    <Box className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/product/${product._id}`}
                                  className="font-bold text-gray-800 hover:text-primary transition-colors block truncate max-w-[180px]"
                                  target="_blank"
                                >
                                  {product.name}
                                </Link>
                                <button
                                  onClick={() => toggleProductDetails(product._id)}
                                  className="text-gray-400 hover:text-primary"
                                  title={isExpanded ? (isRTL ? "إخفاء التفاصيل" : "Less") : (isRTL ? "عرض التفاصيل" : "More")}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-400 block font-mono truncate max-w-[160px]">{product.slug}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="badge badge-outline border-primary/20 text-primary px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary/5 uppercase">
                            {getCategoryName(product.category)}
                          </span>
                        </td>

                        {/* Brand */}
                        <td>
                          <span className="badge badge-outline border-secondary/20 text-secondary px-2.5 py-0.5 rounded-lg text-xs font-medium bg-secondary/5 uppercase">
                            {getBrandName(product.brand)}
                          </span>
                        </td>

                        {/* Pricing */}
                        <td>
                          <div className="flex flex-col">
                            {product.discountPrice && product.isOnSale ? (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-emerald-600">${product.discountPrice.toFixed(2)}</span>
                                  <span className="text-[10px] text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                </div>
                                <span className="text-[9px] font-bold text-red-500">{discountPercent}% OFF</span>
                              </>
                            ) : (
                              <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td>
                          {product.countInStock > 10 ? (
                            <span className="badge badge-success text-white text-[10px] font-semibold px-2">{product.countInStock}</span>
                          ) : product.countInStock > 0 ? (
                            <span className="badge badge-warning text-white text-[10px] font-semibold px-2">{product.countInStock}</span>
                          ) : (
                            <span className="badge badge-error text-white text-[10px] font-semibold px-2">{isRTL ? "نفذ" : "Out"}</span>
                          )}
                        </td>

                        {/* Status badges */}
                        <td>
                          <div className="flex flex-col gap-0.5 items-start">
                            {product.isFeatured && (
                              <span className="badge badge-primary text-[9px] py-0.5 text-white font-bold">{isRTL ? "مميز" : "Featured"}</span>
                            )}
                            {product.isOnSale && (
                              <span className="badge badge-warning text-[9px] py-0.5 text-white font-bold">{isRTL ? "خصم" : "Sale"}</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => onEdit(product)}
                              className="btn btn-sm btn-ghost btn-circle text-blue-600 hover:bg-blue-50"
                              title={isRTL ? "تعديل" : "Edit"}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(product._id, product.name)}
                              className="btn btn-sm btn-ghost btn-circle text-red-600 hover:bg-red-50"
                              title={isRTL ? "حذف" : "Delete"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Collapsed Detail Row */}
                      {isExpanded && (
                        <tr className="bg-base-50/50">
                          <td colSpan="7" className="p-5 border-t border-b border-base-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                              {/* Metadata list */}
                              <div className="space-y-3">
                                <h4 className="font-bold text-gray-800 border-b border-base-300 pb-1 flex items-center gap-1.5">
                                  <Box className="w-4 h-4 text-primary" />
                                  {isRTL ? "معلومات المنتج الإضافية:" : "Additional Product Info:"}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-xs text-gray-400 block">{isRTL ? "رقم التعريف ID:" : "Product ID:"}</span>
                                    <span className="font-mono text-xs text-gray-700 bg-base-200 px-1.5 py-0.5 rounded">{product._id}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-400 block">{isRTL ? "تاريخ الإنشاء:" : "Created Date:"}</span>
                                    <span className="text-gray-700 font-medium">{formatDate(product.createdAt)}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs text-gray-400 block mb-1">{isRTL ? "المقاسات:" : "Sizes:"}</span>
                                    <div className="flex flex-wrap gap-1">
                                      {sizes.length > 0 ? sizes.map((s, idx) => (
                                        <span key={idx} className="badge badge-outline badge-sm font-mono">{s}</span>
                                      )) : <span className="text-gray-400 italic text-xs">{isRTL ? "لا يوجد مقاسات" : "No sizes specified"}</span>}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs text-gray-400 block mb-1">{isRTL ? "الألوان:" : "Colors:"}</span>
                                    <div className="flex flex-wrap gap-1">
                                      {colors.length > 0 ? colors.map((c, idx) => (
                                        <span key={idx} className="badge badge-outline badge-sm">{c}</span>
                                      )) : <span className="text-gray-400 italic text-xs">{isRTL ? "لا يوجد ألوان" : "No colors specified"}</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Description snippet */}
                              <div className="space-y-3">
                                <h4 className="font-bold text-gray-800 border-b border-base-300 pb-1 flex items-center gap-1.5">
                                  <Eye className="w-4 h-4 text-secondary" />
                                  {isRTL ? "الوصف المختصر:" : "Description:"}
                                </h4>
                                <div
                                  className="text-xs text-gray-600 prose prose-sm max-w-none bg-base-100 p-3 rounded-xl border border-base-200"
                                  dangerouslySetInnerHTML={{
                                    __html: product.description ||
                                    `<p class="text-gray-400 italic">${isRTL ? "لا يوجد وصف متاح لهذا المنتج حالياً." : "No description available."}</p>`
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination component */}
      {sortedProducts.length > productsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-100 rounded-2xl border border-base-300 gap-4 shadow-sm">
          <div className="text-xs text-gray-500">
            {isRTL ? "عرض" : "Showing"}{" "}
            <span className="font-bold">{(currentPage - 1) * productsPerPage + 1}</span>{" "}
            {isRTL ? "إلى" : "to"}{" "}
            <span className="font-bold">
              {Math.min(currentPage * productsPerPage, sortedProducts.length)}
            </span>{" "}
            {isRTL ? "من" : "of"}{" "}
            <span className="font-bold">{sortedProducts.length}</span>{" "}
            {isRTL ? "منتج" : "products"}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-xs btn-outline btn-square rounded-lg disabled:opacity-50"
              title="First Page"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-xs btn-outline btn-square rounded-lg disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: Math.ceil(sortedProducts.length / productsPerPage) }, (_, i) => i + 1)
              .filter(page => {
                const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(totalPages, currentPage + 1);
                return page >= startPage && page <= endPage;
              })
              .map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn btn-xs rounded-lg px-2 ${page === currentPage ? 'btn-primary text-white' : 'btn-ghost'}`}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedProducts.length / productsPerPage)))}
              disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
              className="btn btn-xs btn-outline btn-square rounded-lg disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(Math.ceil(sortedProducts.length / productsPerPage))}
              disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
              className="btn btn-xs btn-outline btn-square rounded-lg disabled:opacity-50"
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
