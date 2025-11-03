"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaSync,
} from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdError } from "react-icons/md";

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    amount: "",
    minOrderValue: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    active: true,
    applicableUsers: [],
    applicableProducts: [],
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [page, activeFilter]);

  const fetchCoupons = async (searchQuery = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchQuery) queryParams.set("search", searchQuery);
      if (activeFilter) queryParams.set("active", activeFilter);

      const response = await fetch(`/api/admin/coupons?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setCoupons(page === 1 ? data.coupons : [...coupons, ...data.coupons]);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error(t("failedToLoadCoupons"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(e.target.search.value);
    fetchCoupons(e.target.search.value);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchCoupons("");
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(t("couponCreatedSuccessfully"));
      setShowCreateModal(false);
      resetForm();
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error.message || t("failedToCreateCoupon"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch(`/api/admin/coupons/${editingCoupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(t("couponUpdatedSuccessfully"));
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(error.message || t("failedToUpdateCoupon"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId, couponCode) => {
    if (!confirm(t("confirmDeleteCoupon", { code: couponCode }))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t("failedToDeleteCoupon"));
      }

      toast.success(t("couponDeletedSuccessfully"));
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(error.message || t("failedToDeleteCoupon"));
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(
        t(!currentStatus ? "couponActivatedSuccessfully" : "couponDeactivatedSuccessfully")
      );
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      toast.error(t("failedToUpdateCouponStatus"));
    }
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      amount: coupon.amount,
      minOrderValue: coupon.minOrderValue || "",
      maxDiscount: coupon.maxDiscount || "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : "",
      usageLimit: coupon.usageLimit || "",
      active: coupon.active,
      applicableUsers: coupon.applicableUsers || [],
      applicableProducts: coupon.applicableProducts || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percent",
      amount: "",
      minOrderValue: "",
      maxDiscount: "",
      expiryDate: "",
      usageLimit: "",
      active: true,
      applicableUsers: [],
      applicableProducts: [],
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "free-shipping") {
      return "شحن مجاني";
    }
    return coupon.discountType === "percent"
      ? `${coupon.amount}% خصم`
      : `$${coupon.amount} خصم ثابت`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t("couponManagement")}</h1>
          <p className="text-gray-600 mt-2">
            {t("couponManagementDescription")}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          {t("createNewCoupon")}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder={t("searchCoupons")}
                defaultValue={search}
                className="input input-bordered w-full pr-12"
              />
              <button type="submit" className="absolute left-3 top-3">
                <FaSearch className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="select select-bordered"
          >
            <option value="">{t("allCoupons")}</option>
            <option value="true">{t("activeCoupons")}</option>
            <option value="false">{t("inactiveCoupons")}</option>
          </select>

          {search && (
            <button onClick={handleClearSearch} className="btn btn-outline">
              <FaSync className="w-4 h-4 mr-2" />
              {t("clearSearch")}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{total}</p>
              <p className="text-gray-600">{t("totalCoupons")}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {coupons.filter((c) => c.canBeUsed).length}
              </p>
              <p className="text-gray-600">{t("validCoupons")}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <IoMdCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {coupons.filter((c) => !c.canBeUsed && c.active).length}
              </p>
              <p className="text-gray-600">{t("expiredCoupons")}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <MdError className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {coupons.filter((c) => !c.active).length}
              </p>
              <p className="text-gray-600">{t("disabledCoupons")}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaEyeSlash className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading && coupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="loading loading-spinner text-primary w-8 h-8"></div>
            <p className="mt-4 text-gray-600">{t("loadingCoupons")}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <FaPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t("noCoupons")}
            </h3>
            <p className="text-gray-500 mb-6">
              {t("startCreatingCoupons")}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              {t("createFirstCoupon")}
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>{t("code")}</th>
                    <th>{t("discountType")}</th>
                    <th>{t("value")}</th>
                    <th>{t("expiryDate")}</th>
                    <th>{t("usage")}</th>
                    <th>{t("status")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td>
                        <div className="font-bold">{coupon.code.toUpperCase()}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {formatDiscount(coupon)}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm">
                          {coupon.discountType !== "free-shipping" && (
                            <>
                              <div>
                                {coupon.discountType === "percent"
                                  ? `${coupon.amount}%`
                                  : `$${coupon.amount}`}
                              </div>
                              {coupon.minOrderValue > 0 && (
                                <div className="text-gray-500">
                                  {t("minimumOrder")}: ${coupon.minOrderValue}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(coupon.expiryDate).toLocaleDateString("ar-EG")}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>
                            {coupon.usedCount}{" "}
                            {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {coupon.canBeUsed ? (
                            <span className="badge badge-success">{t("valid")}</span>
                          ) : coupon.active ? (
                            <>
                              <span className="badge badge-error">{t("expired")}</span>
                              {new Date(coupon.expiryDate) < new Date() && (
                                <span className="badge badge-warning">{t("ended")}</span>
                              )}
                            </>
                          ) : (
                            <span className="badge badge-ghost">{t("disabled")}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="btn btn-sm btn-ghost text-blue-600"
                            title={t("edit")}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(coupon._id, coupon.active)
                            }
                            className={`btn btn-sm btn-ghost ${
                              coupon.active ? "text-orange-600" : "text-green-600"
                            }`}
                            title={coupon.active ? t("disable") : t("enable")}
                          >
                            {coupon.active ? (
                              <FaEyeSlash className="w-4 h-4" />
                            ) : (
                              <FaEye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCoupon(coupon._id, coupon.code)
                            }
                            className="btn btn-sm btn-ghost text-red-600"
                            title={t("delete")}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setPage(page + 1)}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading loading-spinner loading-sm"></div>
                  ) : (
                    t("loadMore")
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {showCreateModal ? t("createNewCoupon") : t("editCoupon")}
              </h3>

              <form
                onSubmit={showCreateModal ? handleCreateCoupon : handleEditCoupon}
              >
                <div className="space-y-4">
                  {/* Code */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("couponCode")} *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="input input-bordered w-full font-mono"
                      placeholder="SAVE10"
                      required
                      disabled={showEditModal} // Don't allow code change during edit
                    />
                  </div>

                  {/* Discount Type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("discountType")} *</span>
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({ ...formData, discountType: e.target.value })
                      }
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="percent">{t("percentageDiscount")}</option>
                      <option value="fixed">{t("fixedAmountDiscount")}</option>
                      <option value="free-shipping">{t("freeShipping")}</option>
                    </select>
                  </div>

                  {/* Amount */}
                  {formData.discountType !== "free-shipping" && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          {formData.discountType === "percent" ? t("percentage") : t("amount")}
                           *
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={formData.discountType === "percent" ? "1" : "0.01"}
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className="input input-bordered w-full"
                        placeholder={formData.discountType === "percent" ? "10" : "10.00"}
                        required
                      />
                    </div>
                  )}

                  {/* Min Order Value */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("minimumOrderValue")}</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minOrderValue}
                      onChange={(e) =>
                        setFormData({ ...formData, minOrderValue: e.target.value })
                      }
                      className="input input-bordered w-full"
                      placeholder="100.00"
                    />
                  </div>

                  {/* Max Discount (for percent type) */}
                  {formData.discountType === "percent" && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">{t("maximumDiscount	Optional")}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          setFormData({ ...formData, maxDiscount: e.target.value })
                        }
                        className="input input-bordered w-full"
                        placeholder="50.00"
                      />
                    </div>
                  )}

                  {/* Expiry Date */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("expiryDate")} *</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  {/* Usage Limit */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("usageLimit	Optional")}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, usageLimit: e.target.value })
                      }
                      className="input input-bordered w-full"
                      placeholder={t("unlimitedUsage")}
                    />
                  </div>

                  {/* Active Status */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">{t("activateCoupon")}</span>
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="checkbox"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <div className="loading loading-spinner loading-sm"></div>
                    ) : showCreateModal ? (
                      t("create")
                    ) : (
                      t("update")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
