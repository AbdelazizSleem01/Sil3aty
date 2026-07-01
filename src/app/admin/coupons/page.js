"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Clock,
  Ticket,
  Copy,
  Check,
  Grid,
  List,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Loader2,
  XIcon
} from "lucide-react";

export default function AdminCouponsPage() {
  const { t, i18n } = useTranslation();
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
  const [viewType, setViewType] = useState("card"); // "card" or "table"
  const [copiedCode, setCopiedCode] = useState("");

  const isRTL = i18n.language === "ar";

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
      toast.error(t("failedToLoadCoupons") || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const val = e.target.search.value;
    setSearch(val);
    fetchCoupons(val);
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

      toast.success(t("couponCreatedSuccessfully") || "Coupon created successfully!");
      setShowCreateModal(false);
      resetForm();
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error.message || t("failedToCreateCoupon") || "Failed to create coupon");
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

      toast.success(t("couponUpdatedSuccessfully") || "Coupon updated successfully!");
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(error.message || t("failedToUpdateCoupon") || "Failed to update coupon");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId, couponCode) => {
    const confirmMsg = isRTL 
      ? `هل أنت متأكد من حذف الكوبون "${couponCode}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to delete coupon "${couponCode}"? This cannot be undone.`;
      
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t("failedToDeleteCoupon") || "Failed to delete coupon");
      }

      toast.success(t("couponDeletedSuccessfully") || "Coupon deleted successfully!");
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(error.message || t("failedToDeleteCoupon") || "Failed to delete coupon");
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
        t(!currentStatus ? "couponActivatedSuccessfully" : "couponDeactivatedSuccessfully") || 
        (!currentStatus ? "Coupon activated successfully!" : "Coupon deactivated successfully!")
      );
      setPage(1);
      fetchCoupons(search);
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      toast.error(t("failedToUpdateCouponStatus") || "Failed to update coupon status");
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
      return isRTL ? "شحن مجاني" : "Free Shipping";
    }
    return coupon.discountType === "percent"
      ? (isRTL ? `${coupon.amount}% خصم` : `${coupon.amount}% Off`)
      : (isRTL ? `${coupon.amount} ج.م خصم` : `$${coupon.amount} Off`);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(isRTL ? "تم نسخ الرمز!" : "Code copied!");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-primary" />
            {t("couponManagement") || "Coupon Management"}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("couponManagementDescription") || "Create, edit and manage discount codes for your customers"}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn btn-primary shadow-md hover:shadow-lg transition-all rounded-xl gap-2 text-md"
        >
          <Plus className="w-5 h-5" />
          {t("createNewCoupon") || "Create Coupon"}
        </button>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total */}
        <div className="card bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
            <Ticket className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase opacity-80">{t("totalCoupons") || "Total Coupons"}</p>
              <p className="text-4xl font-black mt-2">{total}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Valid */}
        <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
            <CheckCircle2 className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase opacity-80">{t("validCoupons") || "Active & Valid"}</p>
              <p className="text-4xl font-black mt-2">
                {coupons.filter((c) => c.canBeUsed).length}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Expired */}
        <div className="card bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
            <Clock className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase opacity-80">{t("expiredCoupons") || "Expired Coupons"}</p>
              <p className="text-4xl font-black mt-2">
                {coupons.filter((c) => !c.canBeUsed && c.active).length}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Disabled */}
        <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
            <EyeOff className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase opacity-80">{t("disabledCoupons") || "Disabled"}</p>
              <p className="text-4xl font-black mt-2">
                {coupons.filter((c) => !c.active).length}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <EyeOff className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search form */}
          <form onSubmit={handleSearch} className="w-full lg:flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder={t("searchCoupons") || "Search by coupon code..."}
                defaultValue={search}
                className="input input-bordered w-full pr-12 focus:ring-primary focus:border-primary rounded-xl"
              />
              <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-primary">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex w-full lg:w-auto items-center gap-3 self-stretch lg:self-auto">
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered rounded-xl flex-1 lg:flex-none min-w-[150px]"
            >
              <option value="">{t("allCoupons") || "All Coupons"}</option>
              <option value="true">{t("activeCoupons") || "Active"}</option>
              <option value="false">{t("inactiveCoupons") || "Inactive"}</option>
            </select>

            {search && (
              <button onClick={handleClearSearch} className="btn btn-outline rounded-xl gap-2 flex-1 lg:flex-none">
                <RefreshCw className="w-4 h-4" />
                {t("clearSearch") || "Clear"}
              </button>
            )}

            {/* Layout Toggle Buttons */}
            <div className="join border border-base-300 rounded-xl overflow-hidden self-stretch lg:self-auto">
              <button
                onClick={() => setViewType("card")}
                className={`btn btn-sm join-item px-3.5 h-12 border-none ${viewType === "card" ? "btn-primary" : "btn-ghost text-gray-500"}`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType("table")}
                className={`btn btn-sm join-item px-3.5 h-12 border-none ${viewType === "table" ? "btn-primary" : "btn-ghost text-gray-500"}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Listings */}
      <div>
        {loading && coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl border border-base-300">
            <Loader2 className="loading loading-spinner text-primary w-10 h-10 animate-spin" />
            <p className="mt-4 text-gray-500 font-semibold">{t("loadingCoupons") || "Loading coupons..."}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-300">
            <div className="p-4 bg-primary/10 rounded-full inline-block text-primary mb-4 animate-bounce">
              <Ticket className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("noCoupons") || "No coupons found"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {t("startCreatingCoupons") || "Start creating promotional coupons to drive more sales for your products!"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary rounded-xl"
            >
              {t("createFirstCoupon") || "Create First Coupon"}
            </button>
          </div>
        ) : viewType === "card" ? (
          /* Premium Ticket Perforated Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiryDate) < new Date();
              const isValid = coupon.canBeUsed;

              return (
                <div 
                  key={coupon._id} 
                  className={`relative flex bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[170px] overflow-hidden ${!coupon.active ? "opacity-75" : ""}`}
                >
                  {/* Left Side: Perforated Coupon Indicator */}
                  <div className={`w-[32%] flex flex-col items-center justify-center p-4 relative text-white ${
                    !coupon.active 
                      ? "bg-gradient-to-br from-gray-400 to-gray-500" 
                      : isExpired 
                        ? "bg-gradient-to-br from-red-400 to-rose-600" 
                        : "bg-gradient-to-br from-primary to-primary-focus"
                  }`}>
                    {/* Circle Cutouts for Perforated Border effect */}
                    <div className="absolute top-0 right-0 w-3.5 h-1.5 bg-base-200 rounded-b-full translate-x-1/2 z-10"></div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-1.5 bg-base-200 rounded-t-full translate-x-1/2 z-10"></div>
                    
                    <div className="text-center space-y-1">
                      {coupon.discountType === "percent" ? (
                        <>
                          <div className="flex items-start justify-center">
                            <span className="text-3xl font-black">{coupon.amount}</span>
                            <span className="text-base font-bold mt-1">%</span>
                          </div>
                          <div className="text-[10px] tracking-wider uppercase font-extrabold opacity-95">{isRTL ? "خصم" : "Off"}</div>
                        </>
                      ) : coupon.discountType === "fixed" ? (
                        <>
                          <div className="flex items-start justify-center">
                            <span className="text-lg font-bold mt-1">$</span>
                            <span className="text-3xl font-black">{coupon.amount}</span>
                          </div>
                          <div className="text-[10px] tracking-wider uppercase font-extrabold opacity-95">{isRTL ? "خصم" : "Off"}</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Truck className="w-8 h-8" />
                          <span className="text-[10px] tracking-wide uppercase font-extrabold">{isRTL ? "شحن مجاني" : "Free Ship"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Info & Actions */}
                  <div className="w-[68%] p-4 flex flex-col justify-between relative bg-base-100">
                    {/* Opposite Cutouts */}
                    <div className="absolute top-0 left-0 w-3.5 h-1.5 bg-base-200 rounded-b-full -translate-x-1/2 z-10"></div>
                    <div className="absolute bottom-0 left-0 w-3.5 h-1.5 bg-base-200 rounded-t-full -translate-x-1/2 z-10"></div>
                    
                    <div className="space-y-1.5">
                      {/* Code Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="font-mono text-sm font-bold tracking-wider bg-base-200 text-gray-800 px-2 py-0.5 rounded-lg border border-base-300 uppercase flex items-center gap-1 hover:bg-base-300 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-in" /> : <Copy className="w-3 h-3 text-gray-500" />}
                          <span>{coupon.code}</span>
                        </button>

                        {/* Status Badges */}
                        <div className="flex gap-1">
                          {isValid ? (
                            <span className="badge badge-success badge-sm text-[10px] text-white font-semibold">{t("valid") || "Valid"}</span>
                          ) : coupon.active ? (
                            <span className="badge badge-error badge-sm text-[10px] text-white font-semibold">{t("expired") || "Expired"}</span>
                          ) : (
                            <span className="badge badge-ghost badge-sm text-[10px] font-semibold">{t("disabled") || "Disabled"}</span>
                          )}
                        </div>
                      </div>

                      {/* Constraints Info */}
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {coupon.discountType === "free-shipping" 
                          ? (isRTL ? "متاح للشحن المجاني للطلبات" : "Free shipping on orders")
                          : coupon.minOrderValue > 0 
                            ? (isRTL ? `الحد الأدنى للشراء: ${coupon.minOrderValue} ج.م` : `Min order: $${coupon.minOrderValue}`)
                            : (isRTL ? "بدون حد أدنى للشراء" : "No minimum purchase")}
                      </p>

                      {/* Usage progress bar */}
                      {coupon.usageLimit && (
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>{isRTL ? "حد الاستخدام" : "Usages"}</span>
                            <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full h-1.5 rounded-full" 
                            value={coupon.usedCount} 
                            max={coupon.usageLimit} 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-base-200">
                      {/* Expiry Date */}
                      <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(coupon.expiryDate).toLocaleDateString(i18n.language, { month: "short", day: "numeric", year: "numeric" })}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="btn btn-ghost btn-xs btn-circle text-blue-600 hover:bg-blue-50"
                          title={t("edit")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.active)}
                          className={`btn btn-ghost btn-xs btn-circle ${
                            coupon.active ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"
                          }`}
                          title={coupon.active ? t("disable") : t("enable")}
                        >
                          {coupon.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                          className="btn btn-ghost btn-xs btn-circle text-red-500 hover:bg-red-50"
                          title={t("delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View layout */
          <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-50">
                    <th>{t("code") || "Code"}</th>
                    <th>{t("discountType") || "Type"}</th>
                    <th>{t("value") || "Value"}</th>
                    <th>{t("expiryDate") || "Expiry"}</th>
                    <th>{t("usage") || "Usage"}</th>
                    <th>{t("status") || "Status"}</th>
                    <th className="text-center">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-base-50/50 transition-colors">
                      <td className="font-mono font-bold uppercase text-gray-800">{coupon.code}</td>
                      <td>
                        <span className="badge badge-outline border-primary text-primary px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {coupon.discountType === "percent" ? (isRTL ? "نسبة مئوية" : "Percent") : coupon.discountType === "fixed" ? (isRTL ? "مبلغ ثابت" : "Fixed") : (isRTL ? "شحن مجاني" : "Free Shipping")}
                        </span>
                      </td>
                      <td className="font-semibold text-gray-700">{formatDiscount(coupon)}</td>
                      <td className="text-sm text-gray-500">
                        {new Date(coupon.expiryDate).toLocaleDateString(i18n.language)}
                      </td>
                      <td className="text-sm">
                        {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                      </td>
                      <td>
                        {coupon.canBeUsed ? (
                          <span className="badge badge-success text-white font-medium text-xs px-2.5 py-1">{t("valid") || "Valid"}</span>
                        ) : coupon.active ? (
                          <span className="badge badge-error text-white font-medium text-xs px-2.5 py-1">{t("expired") || "Expired"}</span>
                        ) : (
                          <span className="badge badge-ghost font-medium text-xs px-2.5 py-1">{t("disabled") || "Disabled"}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="btn btn-sm btn-ghost btn-circle text-blue-600 hover:bg-blue-50"
                            title={t("edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon._id, coupon.active)}
                            className={`btn btn-sm btn-ghost btn-circle ${coupon.active ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                            title={coupon.active ? t("disable") : t("enable")}
                          >
                            {coupon.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                            className="btn btn-sm btn-ghost btn-circle text-red-600 hover:bg-red-50"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(page + 1)}
              className="btn btn-outline rounded-xl px-6"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("loadMore") || "Load More"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modern Coupon Creation/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300">
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-base-300">
                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-primary" />
                  {showCreateModal ? (t("createNewCoupon") || "Create New Coupon") : (t("editCoupon") || "Edit Coupon")}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="btn btn-ghost btn-circle btn-sm text-gray-500 hover:bg-base-200"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={showCreateModal ? handleCreateCoupon : handleEditCoupon}
                className="space-y-5"
              >
                {/* Code field */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm">
                    <span>{t("couponCode") || "Coupon Code"} *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="input input-bordered w-full font-mono text-lg font-bold tracking-wider pl-12 uppercase rounded-xl"
                      placeholder="SUMMER20"
                      required
                      disabled={showEditModal}
                    />
                    <Tag className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Type Selection Cards */}
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm mb-1">
                    <span>{t("discountType") || "Discount Type"} *</span>
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "percent" })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        formData.discountType === "percent"
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                          : "border-base-300 hover:border-gray-400 bg-base-50 text-gray-600"
                      }`}
                    >
                      <Percent className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("percentageDiscount") || "Percent"}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "fixed" })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        formData.discountType === "fixed"
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                          : "border-base-300 hover:border-gray-400 bg-base-50 text-gray-600"
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("fixedAmountDiscount") || "Fixed"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "free-shipping" })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        formData.discountType === "free-shipping"
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                          : "border-base-300 hover:border-gray-400 bg-base-50 text-gray-600"
                      }`}
                    >
                      <Truck className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t("freeShipping") || "Free Ship"}</span>
                    </button>
                  </div>
                </div>

                {/* Amount / Value input */}
                {formData.discountType !== "free-shipping" && (
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{formData.discountType === "percent" ? (t("percentage") || "Percentage Discount") : (t("amount") || "Discount Amount")} *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className="input input-bordered w-full pl-12 rounded-xl"
                        placeholder={formData.discountType === "percent" ? "15" : "15.00"}
                        required
                      />
                      {formData.discountType === "percent" ? (
                        <Percent className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Min Order Value */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{t("minimumOrderValue") || "Min Order Purchase"}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minOrderValue}
                        onChange={(e) =>
                          setFormData({ ...formData, minOrderValue: e.target.value })
                        }
                        className="input input-bordered w-full pl-12 rounded-xl"
                        placeholder="100.00"
                      />
                      <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Max Discount for Percentage type */}
                  {formData.discountType === "percent" && (
                    <div className="form-control">
                      <label className="label font-bold text-gray-700 text-sm">
                        <span>{t("maximumDiscount") || "Max Cap Discount"}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxDiscount}
                          onChange={(e) =>
                            setFormData({ ...formData, maxDiscount: e.target.value })
                          }
                          className="input input-bordered w-full pl-12 rounded-xl"
                          placeholder="50.00"
                        />
                        <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{t("expiryDate") || "Expiry Date"} *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expiryDate: e.target.value })
                        }
                        className="input input-bordered w-full pl-12 rounded-xl"
                        required
                      />
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Usage Limit */}
                  <div className="form-control">
                    <label className="label font-bold text-gray-700 text-sm">
                      <span>{t("usageLimit") || "Usage Limit"}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.usageLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, usageLimit: e.target.value })
                        }
                        className="input input-bordered w-full pl-12 rounded-xl"
                        placeholder={t("unlimitedUsage") || "Unlimited"}
                      />
                      <RefreshCw className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="form-control p-4 bg-base-50 rounded-2xl border border-base-300">
                  <label className="label cursor-pointer flex items-center justify-between p-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-800 text-sm">{t("activateCoupon") || "Activate Coupon"}</span>
                      <span className="text-[11px] text-gray-400">{t("activateCouponHint") || "If checked, customers can immediately use this coupon."}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="toggle toggle-primary toggle-md"
                    />
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="btn btn-ghost flex-1 rounded-xl"
                  >
                    {t("cancel") || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 rounded-xl"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : showCreateModal ? (
                      t("create") || "Create"
                    ) : (
                      t("update") || "Save"
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
