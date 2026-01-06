"use client";
import { useState, Fragment } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";

import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaTag, 
  FaBox, 
  FaShoppingCart,
  FaSearch,
  FaFilter,
  FaSort,
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
  FaIdCard
} from "react-icons/fa";

export default function ProductTable({ products = [], onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedProduct, setExpandedProduct] = useState(null);
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
    if (!category) return "Uncategorized";
    if (typeof category === "object") return category.name;
    if (typeof category === "string") return "Loading...";
    return "Invalid Category";
  };

  const getBrandName = (brand) => {
    if (!brand) return "No Brand";
    if (typeof brand === "object") return brand.name;
    if (typeof brand === "string") return "Loading...";
    return "Invalid Brand";
  };

  const calculateDiscountPercentage = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
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
    <div className="bg-base-100 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-base-200">
            <tr>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {t("product") || "Product"}
                  <FaSort className="text-sm" />
                </button>
              </th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {t("category") || "Category"}
                  <FaSort className="text-sm" />
                </button>
              </th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('brand')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {t("brand") || "Brand"}
                  <FaSort className="text-sm" />
                </button>
              </th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {t("pricing") || "Pricing"}
                  <FaSort className="text-sm" />
                </button>
              </th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('countInStock')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {t("stock") || "Stock"}
                  <FaSort className="text-sm" />
                </button>
              </th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">{t("status") || "Status"}</th>
              <th className="py-4 px-6 text-left font-semibold text-gray-700">{t("actions") || "Actions"}</th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedProducts.map((product, index) => {
              const discountPercent = product.discountPercentage || 
                calculateDiscountPercentage(product.price, product.discountPrice);
              const isExpanded = expandedProduct === product._id;
              const sizes = parseSizes(product.sizes);
              const colors = parseColors(product.colors);
              
              return (
                <Fragment key={`fragment-${product._id}`}>
                  <tr 
                    className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                      index % 2 === 0 ? 'bg-base-100' : 'bg-base-50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-lg bg-base-300">
                            {product.images?.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-base-300 flex items-center justify-center">
                                <FaBox className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/product/${product._id}`}
                              className="font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1"
                              target="_blank"
                            >
                              {product.name}
                            </Link>
                              <button
                                onClick={() => toggleProductDetails(product._id)}
                                className="btn btn-ghost btn-xs text-gray-400 hover:text-primary transition-all"
                                title={isExpanded ? (isRTL ? t("hideDetails_ar") || t("hideDetails") : t("hideDetails")) : (isRTL ? t("viewDetails_ar") || t("viewDetails") : t("viewDetails"))}
                              >
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <div className="badge badge-primary badge-lg capitalize">
                        {getCategoryName(product.category)}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-4 px-6">
                      <div className="badge badge-secondary badge-lg">
                        {getBrandName(product.brand)}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        {product.discountPrice && product.isOnSale ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-success">
                                ${product.discountPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaTag className="text-xs text-error" />
                              <span className="text-xs font-bold text-error">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-800">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      <span className={`badge badge-lg ${
                        product.countInStock > 10 
                          ? 'badge-success'
                          : product.countInStock > 0
                          ? 'badge-warning'
                          : 'badge-error'
                      }`}>
                        <FaShoppingCart className="mx-1" />
                        {product.countInStock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {product.isFeatured && (
                          <span className="badge badge-sm badge-primary">
                            <FaStar className="mx-1" />
                            {isRTL ? t("featured_ar") || t("featured") : t("featured")}
                          </span>
                        )}
                        {product.isOnSale && (
                          <span className="badge badge-sm badge-warning whitespace-nowrap">
                            <FaTag className="mx-1" />
                            {isRTL ? t("onSale_ar") || t("onSale") : t("onSale")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="btn btn-warning btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <FaEdit className="text-sm" />
                          {isRTL ? t("edit_ar") || t("edit") : t("edit")}
                        </button>
                        <button
                          onClick={() => onDelete(product._id, product.name)}
                          className="btn btn-error btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <FaTrash className="text-sm" />
                          {isRTL ? t("delete_ar") || t("delete") : t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-base-200/30">
                      <td colSpan="7" className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Product Details */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              <FaBox />
                              {isRTL ? t("productDetails_ar") || t("productDetails") : t("productDetails")}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold text-gray-600 flex items-center gap-1">
                                  <FaIdCard />
                                  Product ID:
                                </span>
                                <div className="text-gray-800 font-mono text-xs mt-1 bg-base-200 p-2 rounded">
                                  {product._id}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-600 flex items-center gap-1">
                                  <FaCalendar />
                                  Created Date:
                                </span>
                                <div className="text-gray-800 mt-1 bg-base-200 p-2 rounded">
                                  {formatDate(product.createdAt)}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-600 flex items-center gap-1">
                                  <FaCalendar />
                                  Last Updated:
                                </span>
                                <div className="text-gray-800 mt-1 bg-base-200 p-2 rounded">
                                  {formatDate(product.updatedAt)}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="font-semibold text-gray-600">Sizes:</span>
                                <div className="text-gray-800 mt-1">
                                  {sizes.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {sizes.map((size, idx) => (
                                        <span key={`size-${product._id}-${idx}`} className="badge badge-outline badge-sm">
                                          {size}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 italic">No sizes specified</span>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="font-semibold text-gray-600">Colors:</span>
                                <div className="text-gray-800 mt-1">
                                  {colors.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {colors.map((color, idx) => (
                                        <span key={`color-${product._id}-${idx}`} className="badge badge-outline badge-sm">
                                          {color}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 italic">No colors specified</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              <FaEye />
                              {isRTL ? t("description_ar") || t("description") : t("description")}
                            </h4>
                            <div
                              className="text-sm text-gray-700 prose prose-sm max-w-none bg-base-100 p-4 rounded-lg border border-base-300"
                              dangerouslySetInnerHTML={{
                                __html: product.description ||
                                `<p class="text-gray-500 italic">${isRTL ? t("noDescriptionAvailable_ar") || t("noDescriptionAvailable") : t("noDescriptionAvailable")}</p>`
                              }}
                            />
                          </div>
                        </div>

                        {/* Images Gallery */}
                        {product.images?.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                              <FaBox />
                              {isRTL ? t("productImages_ar") || t("productImages") : t("productImages")} ({product.images.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {product.images.map((image, index) => (
                                <div key={`image-${product._id}-${index}`} className="relative group">
                                  <div className="aspect-square rounded-lg border-2 border-base-300 overflow-hidden">
                                    <Image
                                      src={image}
                                      alt={`${product.name} - Image ${index + 1}`}
                                      width={120}
                                      height={120}
                                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedProducts.length > productsPerPage && (
        <div className="flex items-center justify-between p-6 border-t border-base-300">
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{(currentPage - 1) * productsPerPage + 1}</span> to{" "}
            <span className="font-bold">
              {Math.min(currentPage * productsPerPage, sortedProducts.length)}
            </span>{" "}
            of <span className="font-bold">{sortedProducts.length}</span> products
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              title="First Page"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: Math.ceil(sortedProducts.length / productsPerPage) }, (_, i) => i + 1)
              .filter(page => {
                const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);
                return page >= startPage && page <= endPage;
              })
              .map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-ghost'} ${page === currentPage ? 'pointer-events-none' : ''}`}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedProducts.length / productsPerPage)))}
              disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(Math.ceil(sortedProducts.length / productsPerPage))}
              disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      )}

      {paginatedProducts.length === 0 && (
        <div className="text-center py-12">
          <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{isRTL ? t("noProductsFound_ar") || t("noProductsFound") : t("noProductsFound")}</p>
        </div>
      )}
    </div>
  );
}
