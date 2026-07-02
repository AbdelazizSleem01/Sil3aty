// app/brands/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaIndustry,
  FaSearch,
  FaBox,
  FaExclamationCircle,
} from "react-icons/fa";

export default function BrandsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      Swal.fire({
        title: isRTL ? "خطأ!" : "Error!",
        text: isRTL ? "فشل في تحميل العلامات التجارية" : "Failed to load brands",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchBrands();
    }
  }, [session]);

  const handleDelete = async (id, brandName) => {
    const result = await Swal.fire({
      title: t("brandsAdmin.deleteConfirmTitle"),
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${t("brandsAdmin.deleteConfirmBody")}</p>
          <p class="text-xl text-primary font-bold">${brandName}</p>
          <p class="text-gray-600 mt-2">${isRTL ? "هذا الإجراء لا يمكن التراجع عنه!" : "This action cannot be undone!"}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isRTL ? "نعم، احذفه!" : "Yes, Delete It!",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/brands/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete brand");
        }

        await Swal.fire({
          title: isRTL ? "تم الحذف!" : "Deleted!",
          text: isRTL 
            ? `تم حذف ${brandName} بنجاح.` 
            : `${brandName} has been deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#10b981",

          customClass: {
            popup: "rounded-2xl",
          },
        });

        fetchBrands();
      } catch (error) {
        Swal.fire({
          title: isRTL ? "خطأ!" : "Error!",
          text: t("brandsAdmin.deleteFailed"),
          icon: "error",
          confirmButtonColor: "#ef4444",

          customClass: {
            popup: "rounded-2xl",
          },
        });
      }
    }
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaIndustry className="text-primary" />
            <span>{t("brandsAdmin.loading")}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {isRTL ? "يرجى الانتظار أثناء جلب العلامات التجارية" : "Please wait while we fetch your brands"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6 ${isRTL ? "font-arabic" : ""}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaIndustry className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {t("brandsAdmin.title")}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaBox className="text-primary" />
                  {t("brandsAdmin.subtitle")}
                </p>
              </div>
            </div>

            <Link
              href="/admin/create-brands"
              className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-8 rounded-xl"
            >
              <FaPlus className="text-lg" />
              {t("brandsAdmin.addBrand")}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400 text-lg`} />
                  <input
                    type="text"
                    placeholder={t("brandsAdmin.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input input-bordered input-lg w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <FaBox className="text-primary" />
                <span>
                  {filteredBrands.length}{" "}
                  {filteredBrands.length === 1 
                    ? (isRTL ? "علامة تجارية" : "brand") 
                    : (isRTL ? "علامات تجارية" : "brands")}{" "}
                  {isRTL ? "تم العثور عليها" : "found"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? t("brandsAdmin.noBrands") : (isRTL ? "لا توجد علامات تجارية بعد" : "No brands available")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? (isRTL ? "جرب تعديل مصطلحات البحث للعثور على ما تبحث عنه." : "Try adjusting your search terms to find what you're looking for.")
                  : t("brandsAdmin.getStarted")}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/create-brands"
                  className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
                >
                  <FaPlus />
                  {t("brandsAdmin.addFirst")}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                {/* Table Header */}
                <thead className="bg-base-200">
                  <tr>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {t("brandsAdmin.logo")}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {t("brandsAdmin.name")}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {t("brandsAdmin.desc")}
                    </th>
                    <th className={`py-4 px-6 ${isRTL ? "text-right" : "text-left"} font-semibold text-gray-700`}>
                      {t("brandsAdmin.actions")}
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredBrands.map((brand, index) => (
                    <tr
                      key={brand._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      {/* Brand Logo */}
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-base-300 p-2">
                            <img
                              loading="lazy"
                              src={brand.logo}
                              alt={`${brand.name} Logo`}
                              className="w-full h-full object-contain rounded-lg"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/64/64";
                                e.target.className =
                                  "w-full h-full object-contain rounded-lg bg-gray-100";
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Brand Name */}
                      <td className="py-4 px-6">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {brand.name}
                          </h3>
                        </div>
                      </td>

                      {/* Brand Description */}
                      <td className="py-4 px-6">
                        <p className="text-gray-600 line-clamp-2 max-w-md">
                          {brand.description}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/create-brands/${brand._id}`}
                            className="btn btn-warning btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <FaEdit className="text-sm" />
                            {t("edit") || "Edit"}
                          </Link>
                          <button
                            onClick={() => handleDelete(brand._id, brand.name)}
                            className="btn btn-error btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <FaTrash className="text-sm" />
                            {t("delete") || "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {filteredBrands.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaIndustry className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {brands.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "إجمالي العلامات التجارية" : "Total Brands"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaBox className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredBrands.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "العلامات المعروضة" : "Displayed Brands"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
