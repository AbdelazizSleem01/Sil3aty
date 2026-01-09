"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import "../../../../i18n";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaLayerGroup,
  FaSearch,
  FaBox,
  FaExclamationCircle,
  FaShieldAlt,
  FaImage,
} from "react-icons/fa";

export default function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isRTL = i18n.language === "ar";

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch categories");
        setCategories(data);
      } catch (err) {
        Swal.fire({
          title: t("common.error"),
          text: err.message,
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchCategories();
    }
  }, [session, t]);

  const handleDelete = async (id, categoryName) => {
    const result = await Swal.fire({
      title: t("deleteCategory"),
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">${t("confirmDelete")}</p>
          <p class="text-xl text-primary font-bold">${categoryName}</p>
          <p class="text-gray-600 mt-2">${t("common.cannotUndo") || "This action cannot be undone!"}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("yesDeleteIt") || "Yes, Delete It!",
      cancelButtonText: t("common.cancel"),

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/category/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        await Swal.fire({
          title: t("categoryDeleted"),
          text: `${categoryName} ${t("categoryDeleted").toLowerCase()}`,
          icon: "success",
          confirmButtonColor: "#10b981",

          customClass: {
            popup: "rounded-2xl",
          },
        });

        setCategories(categories.filter((category) => category._id !== id));
      } catch (err) {
        Swal.fire({
          title: t("common.error"),
          text: err.message,
          icon: "error",
          confirmButtonColor: "#ef4444",

          customClass: {
            popup: "rounded-2xl",
          },
        });
      }
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <p className="text-2xl font-semibold text-gray-700">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="text-8xl text-error mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-error mb-4">{t("accessDenied") || "Access Denied"}</h2>
          <p className="text-gray-600 text-lg">
            {t("redirecting") || "Redirecting to authorized page..."}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaLayerGroup className="text-primary" />
            <span>{t("common.loading")}...</span>
          </div>
          <p className="text-gray-500 mt-2">
            {t("pleaseWait") || "Please wait while we fetch your categories"}
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
                <FaLayerGroup className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {t("categoryManagement")}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaBox className="text-primary" />
                  {t("managingCategories")}
                </p>
              </div>
            </div>

            <Link
              href="/admin/create-category"
              className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-8 rounded-xl"
            >
              <FaPlus className="text-lg" />
              {t("createCategory")}
            </Link>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder={t("searchCategories")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaLayerGroup className="text-primary" />
                <span>
                  {filteredCategories.length}{" "}
                  {t("totalCategories").toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? t("noCategories") : t("noCategoriesAvailable")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? t("adjustSearchTerms") || "Try adjusting your search terms to find what you're looking for."
                  : t("getStartedByCreating") || "Get started by creating your first category to organize products."}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/create-category"
                  className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
                >
                  <FaPlus />
                  {t("createNewCategory")}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="py-4 px-6  font-semibold text-gray-700">
                      {t("categoryName")}
                    </th>
                    <th className="py-4 px-6  font-semibold text-gray-700">
                      {t("categorySlug")}
                    </th>
                    <th className="py-4 px-6  font-semibold text-gray-700">
                      {t("categoryImage")}
                    </th>
                    <th className="py-4 px-6  font-semibold text-gray-700">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={category._id}
                      className={`border-b border-base-300 transition-all duration-200 hover:bg-base-200/50 ${
                        index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {category.name}
                          </h3>
                          
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <code className="bg-base-300 px-2 py-1 rounded text-sm font-mono text-gray-700">
                          {category.slug}
                        </code>
                      </td>

                      <td className="py-4 px-6">
                        {category.image ? (
                          <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-base-300 p-1">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/48/48";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <FaImage className="text-lg" />
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/categories/${category._id}`}
                            className="btn btn-warning btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <FaEdit className="text-sm" />
                            {t("edit")}
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(category._id, category.name)
                            }
                            className="btn btn-error btn-sm flex items-center gap-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <FaTrash className="text-sm" />
                            {t("common.delete")}
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

        {filteredCategories.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaLayerGroup className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {categories.length}
                  </p>
                  <p className="text-sm text-gray-600">{t("totalCategories")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaBox className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredCategories.length}
                  </p>
                  <p className="text-sm text-gray-600">{t("displayedCategories") || "Displayed Categories"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
