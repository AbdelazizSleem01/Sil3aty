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
  Box,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Search,
  DollarSign,
  TrendingUp,
  Tag,
  XCircle,
  Package,
  Star
} from "lucide-react";

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

  useEffect(() => {
    if (selectedProduct) {
      setTimeout(() => {
        const element = document.getElementById("product-form-container");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [selectedProduct]);

  const handleDelete = async (productId, productName) => {
    const titleText = isRTL ? "حذف المنتج؟" : "Delete Product?";
    const confirmBtnText = isRTL ? "نعم، احذفه!" : "Yes, Delete It!";
    const cancelBtnText = isRTL ? "إلغاء" : "Cancel";
    
    const result = await Swal.fire({
      title: titleText,
      html: `
        <div class="text-center font-sans">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${isRTL ? "أنت على وشك حذف المنتج:" : "You are about to delete:"}</p>
          <p class="text-xl text-red-600 font-bold">${productName}</p>
          <p class="text-gray-500 mt-2 text-sm">${isRTL ? "هذا الإجراء لا يمكن التراجع عنه!" : "This action cannot be undone!"}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmBtnText,
      cancelButtonText: cancelBtnText,
      customClass: {
        popup: "rounded-3xl border border-base-200",
        confirmButton: "px-6 py-2.5 rounded-xl font-semibold",
        cancelButton: "px-6 py-2.5 rounded-xl font-semibold",
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
        toast.success(isRTL ? "🗑️ تم حذف المنتج بنجاح" : "🗑️ Product deleted successfully");
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
      toast.info(isRTL ? "تم تحديث قائمة المنتجات!" : "Products list refreshed!");
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
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-700">
            <Package className="text-primary" />
            <span>{t("loadingProducts") || "Loading Products..."}</span>
          </div>
          <p className="text-gray-400">
            {t("fetchingProducts") || "Please wait while we fetch your products"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-primary text-white rounded-2xl shadow-lg">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                {t("productManagement") || "Product Catalog"}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-sm">
                <Eye className="w-4 h-4 text-primary" />
                {t("manageCatalogInventory") || "Manage catalog, stock levels, and store promotions"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSelectedProduct("new")}
              className="btn btn-primary rounded-xl flex-1 sm:flex-none gap-2 h-12 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              {t("addProduct") || "Add Product"}
            </button>
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="card bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
              <Package className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase opacity-85">{t("totalProducts") || "Total Products"}</p>
                <p className="text-4xl font-black mt-2">{products.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="card bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
              <Star className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase opacity-85">{t("featured") || "Featured Products"}</p>
                <p className="text-4xl font-black mt-2">{featuredCount}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Star className="w-6 h-6 fill-white" />
              </div>
            </div>
          </div>

          {/* Sale */}
          <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
              <Tag className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase opacity-85">{t("onSale") || "On Sale"}</p>
                <p className="text-4xl font-black mt-2">{onSaleCount}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Tag className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="card bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
              <XCircle className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase opacity-85">{t("outOfStock") || "Out of Stock"}</p>
                <p className="text-4xl font-black mt-2">{outOfStockCount}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Wrapper */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("searchProducts") || "Search products by name, category, brand, or description..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pr-12 focus:ring-primary focus:border-primary rounded-xl"
                />
                <button type="button" className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Box className="w-4 h-4 text-primary" />
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? (t("product") || "product") : (t("products") || "products")} {t("found") || "found"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Product Form Panel */}
        {selectedProduct && (
          <div id="product-form-container" className="animate-scale-in">
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

        {/* Products Table/Grid Content Wrapper */}
        <div className="bg-base-100 rounded-3xl border border-base-300 overflow-hidden shadow-sm p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {searchTerm ? (t("noProductsFound") || "No products found") : (t("noProductsYet") || "No products yet")}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                {searchTerm
                  ? (t("tryAdjustingSearch") || "Try adjusting your search query or clear filters to locate the product.")
                  : (t("getStartedAddProduct") || "Get started by adding your first product to catalog.")}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setSelectedProduct("new")}
                  className="btn btn-success text-white rounded-xl gap-2 shadow hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  {t("addYourFirstProduct") || "Add First Product"}
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
      </div>
    </div>
  );
}
