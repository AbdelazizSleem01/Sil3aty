"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AdminProductForm from "../../../../components/AdminProductForm";
import ProductTable from "../../../../components/ProductTable";
import {
  FaBox,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaSearch,
  FaDollarSign,
} from "react-icons/fa";

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.title = isRTL ? "Sil3aty - إدارة المنتجات" : "Sil3aty - Product Management";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        isRTL
          ? "إدارة كتالوج المنتجات والمخزون. أضف، عدل، واحذف المنتجات من لوحة التحكم."
          : "Manage your product catalog and inventory. Add, edit, and delete products from the admin dashboard."
      );
    }
  }, [isRTL, i18n.language]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("API did not return an array");

      setProducts(data);
    } catch (error) {
      toast.error(`❌ ${error.message || "Failed to load products"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchProducts();
    }
  }, [status, session]);

  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to delete:</p>
          <p class="text-xl text-primary font-bold">${productName}</p>
          <p class="text-gray-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete It!",
      cancelButtonText: "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Delete failed");

        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success("🗑️ Product deleted successfully");
      } catch (error) {
        toast.error(`❌ ${error.message || "Failed to delete product"}`);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
      toast.info("Products list refreshed!");
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredCount = products.filter((p) => p.isFeatured).length;
  const onSaleCount = products.filter((p) => p.isOnSale).length;
  const outOfStockCount = products.filter((p) => p.countInStock === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className={`flex items-center gap-3 text-2xl font-semibold text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FaBox className="text-primary" />
            <span>{t("loadingProducts") || "Loading Products..."}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {t("fetchingProducts") || "Please wait while we fetch your products"}
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-8xl text-error mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-error mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">
            Admin privileges required to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaBox className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {t("productManagement") || "Product Management"}
                </h1>
                <p className={`text-gray-600 mt-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FaEye className="text-primary" />
                  {t("manageCatalogInventory") || "Manage your product catalog and inventory"}
                </p>
              </div>
            </div>

            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleRefresh}
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 rounded-xl"
              >
                <FaSync className={`text-lg ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("refresh") || "Refresh"}
              </button>
              <button
                onClick={() => setSelectedProduct("new")}
                className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 rounded-xl"
              >
                <FaPlus className={`text-lg ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("addProduct") || "Add Product"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaBox className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {products.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{t("totalProducts") || "Total Products"}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaEye className="text-3xl text-green-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {featuredCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{t("featured") || "Featured"}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaDollarSign className="text-3xl text-warning" />
                <span className="text-3xl font-bold text-gray-800">
                  {onSaleCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{t("onSale") || "On Sale"}</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaExclamationTriangle className="text-3xl text-error" />
                <span className="text-3xl font-bold text-gray-800">
                  {outOfStockCount}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">{t("outOfStock") || "Out of Stock"}</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 text-lg`} />
                  <input
                    type="text"
                    placeholder={t("searchProducts") || "Search products by name, category, brand, or description..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input input-bordered input-lg w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  />
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <FaBox className="text-primary" />
                <span>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? (t("product") || "product") : (t("products") || "products")} {t("found") || "found"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <div className="mb-8">
            <AdminProductForm
              product={selectedProduct === "new" ? null : selectedProduct}
              onSuccess={() => {
                setSelectedProduct(null);
                fetchProducts();
              }}
              onCancel={() => setSelectedProduct(null)}
            />
          </div>
        )}

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? (t("noProductsFound") || "No products found") : (t("noProductsYet") || "No products yet")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? (t("tryAdjustingSearch") || "Try adjusting your search terms to find what you're looking for.")
                  : (t("getStartedAddProduct") || "Get started by adding your first product to your store.")}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setSelectedProduct("new")}
                  className="btn btn-success btn-lg flex items-center gap-2 mx-auto"
                >
                  <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("addYourFirstProduct") || "Add Your First Product"}
                </button>
              )}
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={(product) => setSelectedProduct(product)}
              onDelete={handleDelete}
            />
          )}
        </div>

        {filteredProducts.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaBox className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {products.length}
                  </p>
                  <p className="text-sm text-gray-600">{t("totalProducts") || "Total Products"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FaEye className="text-green-500 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {featuredCount} (
                    {Math.round((featuredCount / products.length) * 100)}%)
                  </p>
                  <p className="text-sm text-gray-600">{t("featuredRate") || "Featured Rate"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
