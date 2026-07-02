"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  Search,
  User,
  Package,
  DollarSign,
  MapPin,
  AlertOctagon,
  CreditCard,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  ShoppingCart,
  BarChart3,
  Users,
  Truck,
  Clock,
  Hash,
  RefreshCw,
  FileText,
  Printer,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});
  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [invoiceLang, setInvoiceLang] = useState("en");
  const [customLogo, setCustomLogo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("storeLogo");
      if (savedLogo) {
        setCustomLogo(savedLogo);
      }
      setInvoiceLang(isRTL ? "ar" : "en");
    }
  }, [isRTL]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setCustomLogo(base64String);
        localStorage.setItem("storeLogo", base64String);
        toast.success(invoiceLang === "ar" ? "✅ تم حفظ الشعار بنجاح" : "✅ Logo saved successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem("storeLogo");
    toast.success(invoiceLang === "ar" ? "✅ تم استعادة الشعار الافتراضي" : "✅ Default logo restored");
  };

  const getLogoBase64 = async () => {
    if (customLogo) return customLogo;
    try {
      const res = await fetch("/images/logo.png");
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  const openInvoiceModal = (order) => {
    setSelectedOrderForInvoice(order);
    setInvoiceLang(isRTL ? "ar" : "en");
    setIsInvoiceModalOpen(true);
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/admin/orders");
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        setError(t("adminOrders.fetching") + " failed");
        toast.error(t("adminOrders.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.isAdmin) fetchOrders();
  }, [session]);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const firstName = order.shippingAddress?.firstName?.toLowerCase() || "";
        const lastName = order.shippingAddress?.lastName?.toLowerCase() || "";
        const orderId = order._id?.toLowerCase() || "";
        const phone = order.shippingAddress?.phone?.toLowerCase() || "";
        const email = order.shippingAddress?.email?.toLowerCase() || "";

        return (
          firstName.includes(lowerCaseQuery) ||
          lastName.includes(lowerCaseQuery) ||
          orderId.includes(lowerCaseQuery) ||
          phone.includes(lowerCaseQuery) ||
          email.includes(lowerCaseQuery)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchQuery, orders, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`✅ ${isRTL ? "تم تحديث حالة الطلب إلى" : "Order status updated to"} ${t("adminOrders." + newStatus.toLowerCase()) || newStatus}`);
    } catch (error) {
      toast.error(isRTL ? "❌ فشل تحديث حالة الطلب" : "❌ Failed to update order status");
    }
  };

  const handlePaymentStatusChange = async (orderId, isPaid) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, {
        isPaid,
      });

      const updatedOrders = orders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              isPaid,
              paidAt: isPaid ? new Date() : null,
            }
          : order
      );

      setOrders(updatedOrders);
      toast.success(
        `✅ ${
          isRTL
            ? `تم تعيين الطلب كـ ${isPaid ? "مدفوع" : "غير مدفوع"}`
            : `Order marked as ${isPaid ? "paid" : "unpaid"}`
        }`
      );
    } catch (error) {
      toast.error(isRTL ? "❌ فشل تحديث حالة الدفع" : "❌ Failed to update payment status");
    }
  };

  const generateInvoicePDF = async (order) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const isAr = invoiceLang === "ar";
    const primaryColor = [22, 163, 74]; // Brand Green #16a34a
    const secondaryColor = [107, 114, 128]; // Gray-500
    const successColor = [22, 163, 74]; // Brand Green
    const darkSlate = [15, 23, 42]; // Slate-900

    const labels = {
      invoice: "INVOICE",
      invoiceId: "Invoice ID",
      date: "Date",
      summary: "ORDER SUMMARY",
      status: "Order Status",
      payment: "Payment Status",
      billTo: "BILL TO",
      shipTo: "SHIP TO",
      product: "Product",
      details: "Details",
      price: "Price",
      qty: "Qty",
      total: "Total",
      subtotal: "Subtotal",
      discount: "Discount",
      shipping: "Shipping Cost",
      finalTotal: "Total Amount",
    };

    // Top primary accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 4, "F");

    const logoData = await getLogoBase64();
    let textStartX = 15;
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", 15, 10, 15, 15);
        textStartX = 35;
      } catch (err) {
        console.error("Error rendering PDF logo", err);
      }
    }

    // Header Company Name
    doc.setTextColor(...darkSlate);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Sil3aty Store", textStartX, 18);

    // Company Meta
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("https://sil3aty.vercel.app/", textStartX, 23);
    doc.text("support@sil3aty-store.com", textStartX, 27);

    // Invoice Label on right
    doc.setTextColor(...primaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(labels.invoice, 195, 20, { align: "right" });

    doc.setTextColor(...darkSlate);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${labels.invoiceId}: Sil3aty-${order._id.substring(18).toUpperCase()}`, 195, 26, { align: "right" });
    doc.text(`${labels.date}: ${new Date(order.createdAt).toLocaleDateString()}`, 195, 30, { align: "right" });

    // Horizontal Separator Line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 35, 195, 35);

    // Invoice Details Summary (Status / Payment)
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 40, 180, 22, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 40, 180, 22);

    doc.setTextColor(...darkSlate);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(labels.summary, 20, 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`${labels.status}:`, 20, 52);
    doc.text(`${labels.payment}:`, 100, 52);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkSlate);
    doc.text(order.status.toUpperCase(), 58, 52);
    
    if (order.isPaid) {
      doc.setTextColor(...successColor);
      doc.text("PAID", 132, 52);
      if (order.paidAt) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondaryColor);
        doc.text(` (On ${new Date(order.paidAt).toLocaleDateString()})`, 142, 52);
      }
    } else {
      doc.setTextColor(239, 68, 68); // Red-500
      doc.text("UNPAID / PENDING", 132, 52);
    }

    // Customer Billing/Shipping info
    const customerInfo = [
      [
        {
          content: labels.billTo,
          styles: {
            fontStyle: "bold",
            fontSize: 8.5,
            fillColor: primaryColor,
            textColor: 255,
          },
        },
        {
          content: labels.shipTo,
          styles: {
            fontStyle: "bold",
            fontSize: 8.5,
            fillColor: primaryColor,
            textColor: 255,
          },
        },
      ],
      [
        `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}\n${order.shippingAddress?.email || ""}\n${order.shippingAddress?.phone || ""}`,
        `${order.shippingAddress?.address || ""}\n${order.shippingAddress?.city || ""}, ${order.shippingAddress?.country || ""}\nPostal Code: ${order.shippingAddress?.postalCode || ""}`,
      ],
    ];

    autoTable(doc, {
      startY: 68,
      head: customerInfo.slice(0, 1),
      body: customerInfo.slice(1),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: "normal" },
        1: { cellWidth: 90, fontStyle: "normal" },
      },
      margin: { left: 15, right: 15 },
    });

    // Items list
    const tableColumn = [labels.product, labels.details, labels.price, labels.qty, labels.total];
    const tableRows = order.orderItems.map((item) => [
      item.name,
      `${item.color || "N/A"} / ${item.size || "N/A"}`,
      `$${item.price.toFixed(2)}`,
      item.qty.toString(),
      `$${(item.price * item.qty).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [241, 245, 249],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 75 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });

    // Pricing details block
    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(250, 250, 250);
    doc.rect(125, finalY, 70, 32, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(125, finalY, 70, 32);

    doc.setFontSize(8);
    doc.setTextColor(...darkSlate);
    
    // Subtotal
    doc.setFont("helvetica", "normal");
    doc.text(`${labels.subtotal}:`, 129, finalY + 6);
    doc.text(`$${(order.subTotal || order.totalPrice).toFixed(2)}`, 191, finalY + 6, { align: "right" });

    // Discount
    let offset = 0;
    if (order.discountAmount > 0) {
      doc.setTextColor(...successColor);
      doc.text(`${labels.discount} (${order.discountCode}):`, 129, finalY + 12);
      doc.text(`-$${order.discountAmount.toFixed(2)}`, 191, finalY + 12, { align: "right" });
      doc.setTextColor(...darkSlate);
      offset = 6;
    }

    // Shipping
    doc.text(`${labels.shipping}:`, 129, finalY + 12 + offset);
    const shipping = order.shippingCost || 0;
    doc.text(`$${shipping.toFixed(2)}`, 191, finalY + 12 + offset, { align: "right" });

    // Total
    doc.setDrawColor(226, 232, 240);
    doc.line(129, finalY + 18 + offset, 191, finalY + 18 + offset);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text(`${labels.finalTotal}:`, 129, finalY + 24 + offset);
    doc.text(`$${(order.finalTotal || order.totalPrice).toFixed(2)}`, 191, finalY + 24 + offset, { align: "right" });

    // Footer
    const footerY = 272;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, footerY, 195, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text(isAr ? "Thank you for shopping with Sil3aty Store!" : "Thank you for shopping with Sil3aty Store!", 15, footerY + 5);
    doc.text("For support: support@sil3aty-store.com | +20 1012105407", 15, footerY + 9);
    doc.text("All sales are subject to terms and return conditions.", 15, footerY + 13);

    const fileName = `Sil3aty-Invoice-${order._id.substring(18).toUpperCase()}.pdf`;
    doc.save(fileName);
    toast.success("📄 Invoice PDF downloaded successfully!");
  };

  const generateCompactInvoice = async (order) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 180], // Extended height for items space
    });

    const isAr = invoiceLang === "ar";
    const primaryColor = [22, 163, 74];
    const secondaryColor = [107, 114, 128];
    const successColor = [22, 163, 74];
    const darkSlate = [15, 23, 42];

    // Colored bar at the top
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 80, 3, "F");

    // Logo image rendering
    const logoData = await getLogoBase64();
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", 32, 5, 15, 15);
      } catch (err) {
        console.error("Error rendering receipt logo", err);
      }
    }

    // Centered Store Header
    doc.setTextColor(...darkSlate);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Sil3aty Store", 40, logoData ? 24 : 10, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("https://sil3aty.vercel.app/", 40, logoData ? 27 : 13, { align: "center" });
    doc.text("support@sil3aty-store.com", 40, logoData ? 30 : 16, { align: "center" });

    // Separator line
    const sepY = logoData ? 33 : 19;
    doc.setDrawColor(229, 231, 235);
    doc.line(5, sepY, 75, sepY);

    // Receipt Meta
    doc.setTextColor(...darkSlate);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("RECEIPT DETAILS", 5, sepY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...secondaryColor);
    doc.text(`Receipt #: Sil3aty-${order._id.substring(18).toUpperCase()}`, 5, sepY + 9);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 5, sepY + 13);
    doc.text(`Status: ${order.status.toUpperCase()}`, 5, sepY + 17);

    doc.text("BILL TO / SHIP TO:", 42, sepY + 9);
    const clientName = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`;
    doc.text(clientName.substring(0, 20), 42, sepY + 13);
    doc.text(order.shippingAddress?.phone || "", 42, sepY + 17);

    doc.setDrawColor(229, 231, 235);
    doc.line(5, sepY + 21, 75, sepY + 21);

    // Items Section
    doc.setTextColor(...darkSlate);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("ITEMS DESCRIPTION", 5, sepY + 26);

    doc.setDrawColor(241, 245, 249);
    doc.line(5, sepY + 28, 75, sepY + 28);

    let yPos = sepY + 32;
    order.orderItems.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...darkSlate);
      const name = item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name;
      doc.text(name, 5, yPos);
      yPos += 3.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...secondaryColor);
      doc.text(`${item.color || "N/A"} / ${item.size || "N/A"}`, 5, yPos);
      doc.text(`${item.qty} x $${item.price.toFixed(2)}`, 35, yPos);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkSlate);
      doc.text(`$${(item.price * item.qty).toFixed(2)}`, 75, yPos, { align: "right" });
      yPos += 5;
    });

    doc.setDrawColor(229, 231, 235);
    doc.line(5, yPos, 75, yPos);
    yPos += 4;

    // Totals Breakdown
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...secondaryColor);
    doc.text("Subtotal:", 5, yPos);
    doc.text(`$${(order.subTotal || order.totalPrice).toFixed(2)}`, 75, yPos, { align: "right" });
    yPos += 4;

    if (order.discountAmount > 0) {
      doc.setTextColor(...successColor);
      doc.text(`Discount (${order.discountCode}):`, 5, yPos);
      doc.text(`-$${order.discountAmount.toFixed(2)}`, 75, yPos, { align: "right" });
      doc.setTextColor(...secondaryColor);
      yPos += 4;
    }

    doc.text("Shipping:", 5, yPos);
    doc.text(`$${(order.shippingCost || 0).toFixed(2)}`, 75, yPos, { align: "right" });
    yPos += 4.5;

    // Final Total Box
    doc.setFillColor(248, 250, 252);
    doc.rect(5, yPos - 1.5, 70, 7, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(5, yPos - 1.5, 70, 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    doc.text("TOTAL AMOUNT:", 7, yPos + 3);
    doc.text(`$${(order.finalTotal || order.totalPrice).toFixed(2)}`, 73, yPos + 3, { align: "right" });

    // Receipt Footer
    yPos += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...secondaryColor);
    doc.text(isAr ? "Thank you for shopping with us!" : "Thank you for shopping with us!", 40, yPos, { align: "center" });
    doc.text("Please keep this receipt for your records.", 40, yPos + 3, { align: "center" });

    const fileName = `Sil3aty-Receipt-${order._id.substring(18).toUpperCase()}.pdf`;
    doc.save(fileName);
    toast.success("📄 Compact receipt downloaded!");
  };

  const printInvoice = async (order) => {
    const logoData = await getLogoBase64();
    const isAr = invoiceLang === "ar";
    const printWindow = window.open("", "_blank");
    const invoiceContent = `
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <title>Invoice - ${order._id.substring(18).toUpperCase()}</title>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            color: #0f172a;
            background-color: #f8fafc;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .container {
            max-width: 850px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border: 1px solid #e2e8f0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .header-brand {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            color: #16a34a;
          }
          .header p {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #64748b;
          }
          .invoice-label {
            text-align: right;
          }
          html[dir="rtl"] .invoice-label {
            text-align: left;
          }
          .invoice-label h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          .info-card h3 {
            margin: 0 0 12px 0;
            font-size: 12px;
            font-weight: 800;
            color: #16a34a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .info-card p {
            margin: 6px 0;
            font-size: 14px;
            color: #334155;
            line-height: 1.5;
          }
          .table-container {
            margin-bottom: 40px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          html[dir="rtl"] .table {
            text-align: right;
          }
          .table th {
            background: #16a34a;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 12px 16px;
            text-transform: uppercase;
          }
          .table th:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }
          .table th:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          html[dir="rtl"] .table th:first-child {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          html[dir="rtl"] .table th:last-child {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }
          .table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
            color: #334155;
          }
          .table tr:hover td {
            background-color: #f8fafc;
          }
          .summary-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          html[dir="rtl"] .summary-container {
            justify-content: flex-start;
          }
          .summary-box {
            width: 320px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
            color: #475569;
          }
          .summary-row.discount {
            color: #16a34a;
            font-weight: 500;
          }
          .summary-row.total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            font-size: 18px;
            font-weight: 800;
            color: #16a34a;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 2px solid #f1f5f9;
            padding-top: 30px;
            margin-top: 40px;
          }
          .btn-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
          }
          .btn {
            padding: 10px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #16a34a;
            color: #ffffff;
            box-shadow: 0 4px 6px -1px rgb(22 163 74 / 0.2);
          }
          .btn-primary:hover {
            background: #15803d;
            transform: translateY(-1px);
          }
          .btn-secondary {
            background: #64748b;
            color: #ffffff;
          }
          .btn-secondary:hover {
            background: #475569;
            transform: translateY(-1px);
          }
          @media print {
            body {
              background-color: #ffffff;
              padding: 0;
            }
            .container {
              box-shadow: none;
              border: none;
              padding: 0;
            }
            .btn-container {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-brand">
              ${logoData ? `<img src="${logoData}" alt="Logo" style="height: 60px; width: auto; object-fit: contain;" />` : ""}
              <div>
                <h1>Sil3aty Store</h1>
                <p>https://sil3aty.vercel.app/</p>
                <p>support@sil3aty-store.com</p>
              </div>
            </div>
            <div class="invoice-label">
              <h2>${isAr ? "فاتورة شراء" : "INVOICE"}</h2>
              <p><strong>${isAr ? "رقم الفاتورة" : "Invoice ID"}:</strong> Sil3aty-${order._id.substring(18).toUpperCase()}</p>
              <p><strong>${isAr ? "التاريخ" : "Date"}:</strong> ${new Date(order.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US")}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>${isAr ? "بيانات الشحن والتوصيل" : "SHIP TO"}</h3>
              <p><strong>${isAr ? "الاسم" : "Name"}:</strong> ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</p>
              <p><strong>${isAr ? "الهاتف" : "Phone"}:</strong> ${order.shippingAddress?.phone}</p>
              <p><strong>${isAr ? "البريد الإلكتروني" : "Email"}:</strong> ${order.shippingAddress?.email}</p>
            </div>
            <div class="info-card">
              <h3>${isAr ? "تفاصيل الطلب والدفع" : "ORDER & PAYMENT"}</h3>
              <p><strong>${isAr ? "عنوان التوصيل" : "Address"}:</strong> ${order.shippingAddress?.address}</p>
              <p><strong>${isAr ? "البلد / المدينة" : "City/Country"}:</strong> ${order.shippingAddress?.city}, ${order.shippingAddress?.country}</p>
              <p><strong>${isAr ? "حالة الدفع" : "Payment Status"}:</strong> 
                <span style="font-weight: 700; color: ${order.isPaid ? "#16a34a" : "#ef4444"}">
                  ${order.isPaid ? (isAr ? "مدفوع" : "PAID") : (isAr ? "قيد الانتظار" : "PENDING")}
                </span>
              </p>
            </div>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>${isAr ? "المنتج" : "Product"}</th>
                  <th>${isAr ? "المواصفات" : "Details"}</th>
                  <th style="text-align: right;">${isAr ? "السعر" : "Price"}</th>
                  <th style="text-align: center;">${isAr ? "الكمية" : "Qty"}</th>
                  <th style="text-align: right;">${isAr ? "الإجمالي" : "Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems
                  .map(
                    (item) => `
                  <tr>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td>${item.color || "N/A"} / ${item.size || "N/A"}</td>
                    <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="text-align: center; font-weight: 600;">${item.qty}</td>
                    <td style="text-align: right; font-weight: 700; color: #16a34a;">$${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="summary-container">
            <div class="summary-box">
              <div class="summary-row">
                <span>${isAr ? "المجموع الفرعي" : "Subtotal"}:</span>
                <span>$${(order.subTotal || order.totalPrice).toFixed(2)}</span>
              </div>
              ${
                order.discountAmount > 0
                  ? `
                <div class="summary-row discount">
                  <span>${isAr ? "الخصم" : "Discount"} (${order.discountCode}):</span>
                  <span>-$${order.discountAmount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div class="summary-row">
                <span>${isAr ? "مصاريف الشحن" : "Shipping"}:</span>
                <span>$${(order.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>${isAr ? "الإجمالي النهائي" : "Total"}:</span>
                <span>$${(order.finalTotal || order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>${isAr ? "شكراً لتسوقكم من متجر سلعتي!" : "Thank you for shopping with Sil3aty Store!"}</p>
            <p>https://sil3aty.vercel.app/ | support@sil3aty-store.com</p>
          </div>
        </div>

        <div class="btn-container no-print">
          <button class="btn btn-primary" onclick="window.print()">${isAr ? "طباعة الفاتورة" : "Print Invoice"}</button>
          <button class="btn btn-secondary" onclick="window.close()">${isAr ? "إغلاق" : "Close"}</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
    toast.success("📊 Orders exported successfully!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      case "shipped":
        return "badge-info";
      case "processing":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      case "shipped":
        return <Truck className="w-3 h-3" />;
      case "processing":
        return <Clock className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  const stats = {
    total: orders.length,
    paid: orders.filter((order) => order.isPaid).length,
    pending: orders.filter((order) => order.status === "processing").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    revenue: orders.reduce((sum, order) => sum + (order.finalTotal || order.totalPrice || 0), 0),
  };

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-2xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-error/10 rounded-2xl">
                <AlertOctagon className="w-12 h-12 text-error animate-pulse" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-error mb-2">
              {t("adminOrders.accessDenied")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("adminOrders.noPermission")}
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary btn-outline"
            >
              {t("adminOrders.goBack")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <ShoppingCart className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3 text-gray-800">
            <Package className="animate-pulse" /> {t("adminOrders.loading")}
          </h1>
          <p className="text-gray-500 mb-4">{t("adminOrders.fetching")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-2xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-error/10 rounded-2xl">
                <AlertOctagon className="w-12 h-12 text-error" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl font-bold text-error mb-2">
              {t("adminOrders.errorLoading")}
            </h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t("adminOrders.retry")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatRevenue = (value) => {
    if (value >= 1.0e9) {
      return `$${(value / 1.0e9).toFixed(2)}B`;
    } else if (value >= 1.0e6) {
      return `$${(value / 1.0e6).toFixed(2)}M`;
    } else if (value >= 1.0e3) {
      return `$${(value / 1.0e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-slate-50/50 p-4 lg:p-8 ${isRTL ? "font-arabic" : ""}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/20 border border-base-300 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-primary to-primary/50 text-white rounded-2xl shadow-lg shadow-primary/20">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {t("adminOrders.title")}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {t("adminOrders.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToExcel}
              className="btn bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-none shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl px-5 py-3 h-auto font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("adminOrders.exportExcel")}
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white/80 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{t("adminOrders.total")}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{isRTL ? "إجمالي المبيعات" : "Total Revenue"}</p>
                <p className="text-2xl font-extrabold text-success mt-1 truncate" title={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                  {formatRevenue(stats.revenue)}
                </p>
              </div>
              <div className="p-3 bg-success/10 text-success rounded-xl flex-shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{t("adminOrders.paid")}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.paid}</p>
              </div>
              <div className="p-3 bg-success/10 text-success rounded-xl flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{t("adminOrders.pending")}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-warning/10 text-warning rounded-xl flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-info/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{t("adminOrders.delivered")}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.delivered}</p>
              </div>
              <div className="p-3 bg-info/10 text-info rounded-xl flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-md border border-base-300 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t("adminOrders.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-50 border border-base-300 rounded-xl py-3 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                />
              </div>
            </div>

            <div className="flex flex-row gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered rounded-xl border-base-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm h-12 flex-1 md:flex-initial md:w-44"
              >
                <option value="all">{t("adminOrders.allStatus")}</option>
                <option value="processing">{t("adminOrders.processing")}</option>
                <option value="shipped">{t("adminOrders.shipped")}</option>
                <option value="delivered">{t("adminOrders.deliveredOption")}</option>
                <option value="cancelled">{t("adminOrders.cancelled")}</option>
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="select select-bordered rounded-xl border-base-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm h-12 flex-1 md:flex-initial md:w-36"
              >
                <option value={5}>{t("adminOrders.perPage", { count: 5 })}</option>
                <option value={10}>{t("adminOrders.perPage", { count: 10 })}</option>
                <option value={20}>{t("adminOrders.perPage", { count: 20 })}</option>
                <option value={50}>{t("adminOrders.perPage", { count: 50 })}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="bg-white border border-base-300 rounded-2xl shadow-sm text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {t("adminOrders.noOrders")}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              {isRTL ? "جرب تعديل شروط البحث أو الفلاتر" : "Try adjusting your search or filters"}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="btn btn-primary btn-sm rounded-xl px-6 gap-2"
            >
              <Filter className="w-4 h-4" />
              {t("adminOrders.clearFilters")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => {
              const isExpanded = !!expandedOrders[order._id];
              return (
                <div
                  key={order._id}
                  className={`bg-white border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                    order.status === "cancelled" ? "border-l-4 border-l-red-500" :
                    order.status === "delivered" ? "border-l-4 border-l-green-500" :
                    order.status === "shipped" ? "border-l-4 border-l-blue-500" :
                    "border-l-4 border-l-amber-500"
                  }`}
                >
                  {/* Compact/Main Header Row */}
                  <div
                    onClick={() => toggleExpand(order._id)}
                    className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="p-2.5 bg-slate-100 rounded-xl text-gray-700">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-gray-900">
                            {t("adminOrders.orderNo")}{order._id.substring(18).toUpperCase()}
                          </h2>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="flex items-center gap-2">
                        {order.discountCode && (
                          <div className="badge badge-success badge-sm font-semibold rounded-lg px-2">
                            {t("adminOrders.coupon")}
                          </div>
                        )}
                        <div className={`badge ${getStatusColor(order.status)} font-semibold rounded-lg px-2.5 py-1 gap-1 text-xs`}>
                          {getStatusIcon(order.status)}
                          {t("adminOrders." + order.status.toLowerCase()) || order.status}
                        </div>
                        <div className={`badge ${order.isPaid ? "badge-success" : "badge-error"} font-semibold rounded-lg px-2.5 py-1 gap-1 text-xs`}>
                          {order.isPaid ? t("adminOrders.paidLabel") : t("adminOrders.unpaidLabel")}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">{isRTL ? "إجمالي المبلغ" : "Total Amount"}</span>
                          <span className="text-lg font-black text-primary">
                            ${(order.finalTotal || order.totalPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-100 hover:bg-slate-200 text-gray-500 rounded-xl transition-all">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Block Details */}
                  {isExpanded && (
                    <div className="p-6 border-t border-base-200 bg-slate-50/30 space-y-6">
                      {/* Customer Info Card & Shipping Info Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-base-300 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-base-200">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                              <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm">
                              {t("adminOrders.customerDetails")}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-700 font-semibold">
                              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </p>
                            <p className="text-gray-500 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {order.shippingAddress?.email}
                            </p>
                            <p className="text-gray-500 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-base-300 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-base-200">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm">
                              {t("adminOrders.shippingAddress")}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-700">
                              {order.shippingAddress?.address}
                            </p>
                            <p className="text-gray-500">
                              {order.shippingAddress?.city}, {order.shippingAddress?.country}
                            </p>
                            <p className="text-xs text-gray-400">
                              {t("adminOrders.postalCode")}: {order.shippingAddress?.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items Ordered Table */}
                      <div className="bg-white border border-base-300 rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2 pb-3 border-b border-base-200">
                          <Package className="w-5 h-5 text-primary" />
                          {t("adminOrders.orderItems")} ({order.orderItems.length})
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <thead>
                              <tr className="bg-slate-50 text-gray-500">
                                <th>{t("adminOrders.product")}</th>
                                <th>{t("adminOrders.details")}</th>
                                <th className="text-right">{t("adminOrders.price")}</th>
                                <th className="text-center">{t("adminOrders.qty")}</th>
                                <th className="text-right">{t("adminOrders.totalAmount")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.orderItems.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td>
                                    <div className="flex items-center gap-3">
                                      <div className="avatar">
                                        <div className="w-12 h-12 rounded-xl border border-base-300 overflow-hidden bg-slate-100">
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        <span className="text-xs text-gray-400 font-mono">({item.product?._id || item.product})</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.color && (
                                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-base-300">
                                          <div
                                            className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                            style={{ backgroundColor: item.color }}
                                          />
                                          <span className="text-[10px] text-gray-600 font-medium">
                                            {item.color}
                                          </span>
                                        </div>
                                      )}
                                      {item.size && (
                                        <span className="badge badge-sm badge-outline text-[10px] font-semibold border-base-300">
                                          {item.size}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right font-semibold text-gray-700">
                                    ${item.price.toFixed(2)}
                                  </td>
                                  <td className="text-center font-bold text-gray-800">
                                    {item.qty}
                                  </td>
                                  <td className="text-right font-black text-primary">
                                    ${(item.price * item.qty).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pricing Breakdown & Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {order.discountCode ? (
                          <div className="bg-success/5 border border-success/20 rounded-xl p-5 space-y-3">
                            <h4 className="font-bold text-success text-sm flex items-center gap-2">
                              <span>{t("adminOrders.couponInfo")}</span>
                            </h4>
                            <div className="space-y-2 text-sm text-success font-medium">
                              <div className="flex justify-between">
                                <span>{t("adminOrders.couponCode")}</span>
                                <span className="font-mono bg-success/10 px-2 py-0.5 rounded-md">
                                  {order.discountCode}
                                </span>
                              </div>
                              {order.discountAmount > 0 && (
                                <div className="flex justify-between">
                                  <span>{t("adminOrders.discountAmount")}</span>
                                  <span>-${order.discountAmount.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-100/50 rounded-xl p-5 flex flex-col justify-center items-center text-center text-gray-400 border border-dashed border-base-300">
                            <DollarSign className="w-8 h-8 opacity-40 mb-2" />
                            <span className="text-xs">{isRTL ? "لم يتم استخدام كوبون خصم لهذا الطلب" : "No discount coupon was applied"}</span>
                          </div>
                        )}

                        <div className="bg-white border border-base-300 rounded-xl p-5 shadow-sm space-y-3">
                          <h4 className="font-bold text-gray-800 text-sm pb-2 border-b border-base-200">
                            {t("adminOrders.priceDetails")}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>{t("adminOrders.originalPrice")}</span>
                              <span className="font-semibold text-gray-800">
                                ${order.subTotal?.toFixed(2) || order.totalPrice.toFixed(2)}
                              </span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-success">
                                <span>{t("adminOrders.discount")}</span>
                                <span className="font-bold">-${order.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {order.shippingCost > 0 && (
                              <div className="flex justify-between">
                                <span>{t("adminOrders.shippingCost")}</span>
                                <span className="font-semibold text-gray-800">${order.shippingCost.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-base-200 pt-3 mt-1 flex justify-between items-center text-base font-black text-primary">
                              <span>{t("adminOrders.finalPrice")}</span>
                              <span>
                                ${(order.finalTotal || order.totalPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Card Controls Footer */}
                      <div className="pt-4 border-t border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t("adminOrders.totalAmount")}</span>
                          <span className="text-2xl font-black text-primary">
                            ${(order.finalTotal || order.totalPrice).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          <button
                            onClick={() => openInvoiceModal(order)}
                            className="btn btn-outline btn-sm rounded-xl gap-2 w-full md:w-auto border-base-300"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            {t("adminOrders.invoiceOptions")}
                          </button>

                          <button
                            onClick={() => handlePaymentStatusChange(order._id, !order.isPaid)}
                            className={`btn btn-sm rounded-xl gap-2 w-full md:w-auto ${
                              order.isPaid ? "btn-error btn-outline" : "btn-success"
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            {order.isPaid ? t("adminOrders.markUnpaid") : t("adminOrders.markPaid")}
                          </button>

                          <div className="flex items-center gap-1.5 w-full md:w-auto">
                            <span className="text-xs text-gray-400 hidden md:inline">{t("adminOrders.changeStatus")}:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="select select-bordered select-sm rounded-xl border-base-300 focus:ring-primary/20 w-full md:w-auto"
                            >
                              <option value="processing">{t("adminOrders.processing")}</option>
                              <option value="shipped">{t("adminOrders.shipped")}</option>
                              <option value="delivered">{t("adminOrders.deliveredOption")}</option>
                              <option value="cancelled">{t("adminOrders.cancelled")}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 border border-base-300 p-5 rounded-2xl shadow-sm">
            <div className="text-sm text-gray-500">
              {isRTL ? (
                <>
                  عرض <span className="font-bold text-gray-800">{startIndex + 1}</span> إلى <span className="font-bold text-gray-800">{Math.min(endIndex, filteredOrders.length)}</span> من <span className="font-bold text-primary">{filteredOrders.length}</span> طلبات
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-gray-800">{startIndex + 1}</span> to <span className="font-bold text-gray-800">{Math.min(endIndex, filteredOrders.length)}</span> of <span className="font-bold text-primary">{filteredOrders.length}</span> orders
                </>
              )}
            </div>

            <div className="join gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="join-item btn btn-sm rounded-xl border-base-300"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="join-item btn btn-sm rounded-xl border-base-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`join-item btn btn-sm rounded-xl border-base-300 ${
                      currentPage === pageNum ? "btn-primary shadow-sm" : "btn-ghost text-gray-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="join-item btn btn-sm rounded-xl border-base-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="join-item btn btn-sm rounded-xl border-base-300"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* Invoice Modal Overlay */}
        {isInvoiceModalOpen && selectedOrderForInvoice && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
            <div className="bg-white border border-base-300 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 p-6 space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-base-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isRTL ? "إعدادات وتوليد الفاتورة" : "Invoice Generator Settings"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRTL 
                      ? `طلب رقم: #${selectedOrderForInvoice._id.substring(18).toUpperCase()}` 
                      : `Order: #${selectedOrderForInvoice._id.substring(18).toUpperCase()}`
                    }
                  </p>
                </div>
                <button 
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              {/* Lang select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  {isRTL ? "لغة الفاتورة" : "Invoice Language"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInvoiceLang("ar")}
                    className={`btn btn-sm rounded-xl border border-base-300 font-semibold gap-2 ${
                      invoiceLang === "ar" ? "btn-primary text-white" : "btn-ghost"
                    }`}
                  >
                    🇸🇦 العربية (Arabic)
                  </button>
                  <button
                    onClick={() => setInvoiceLang("en")}
                    className={`btn btn-sm rounded-xl border border-base-300 font-semibold gap-2 ${
                      invoiceLang === "en" ? "btn-primary text-white" : "btn-ghost"
                    }`}
                  >
                    🇺🇸 English (الإنجليزية)
                  </button>
                </div>
              </div>

              {/* Custom Logo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  {isRTL ? "شعار المتجر (الفاتورة)" : "Invoice Store Logo"}
                </label>
                <div className="flex items-center gap-4 bg-slate-50 border border-dashed border-base-300 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-xl border border-base-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0 relative group">
                    <img 
                      src={customLogo || "/images/logo.png"} 
                      alt="Store Logo" 
                      className="object-contain w-full h-full p-1"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="logo-file-input" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                    <div className="flex gap-2">
                      <label 
                        htmlFor="logo-file-input"
                        className="btn btn-xs btn-primary text-white rounded-lg cursor-pointer"
                      >
                        {isRTL ? "رفع شعار" : "Upload Logo"}
                      </label>
                      {customLogo && (
                        <button 
                          onClick={handleRemoveLogo}
                          className="btn btn-xs btn-error btn-outline rounded-lg"
                        >
                          {isRTL ? "حذف" : "Remove"}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {isRTL 
                        ? "يفضل رفع صورة مربعة بخلفية شفافة (PNG)" 
                        : "Prefer square transparent PNG image"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={async () => {
                    await generateInvoicePDF(selectedOrderForInvoice);
                  }}
                  className="btn btn-primary w-full rounded-xl gap-2 font-bold justify-center text-white"
                >
                  <FileText className="w-4 h-4" />
                  {isRTL ? "تحميل الفاتورة القياسية (PDF)" : "Download Standard PDF Invoice"}
                </button>
                <button
                  onClick={async () => {
                    await generateCompactInvoice(selectedOrderForInvoice);
                  }}
                  className="btn btn-outline btn-primary w-full rounded-xl gap-2 font-bold justify-center"
                >
                  <Printer className="w-4 h-4" />
                  {isRTL ? "تحميل إيصال الكاشير المصغر (PDF)" : "Download Compact Receipt PDF"}
                </button>
                <button
                  onClick={() => printInvoice(selectedOrderForInvoice)}
                  className="btn btn-ghost border border-base-300 w-full rounded-xl gap-2 font-bold justify-center text-gray-700 hover:bg-slate-50"
                >
                  <Globe className="w-4 h-4" />
                  {isRTL ? "طباعة الفاتورة للعميل" : "Print Invoice for Customer"}
                </button>
              </div>

              {/* PDF Warning */}
              {invoiceLang === "ar" && (
                <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-[10px] text-amber-800 leading-normal flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">⚠️ ملاحظة:</span>
                  <span>
                    ملفات الـ PDF تدعم النصوص اللاتينية. للحصول على فاتورة باللغة العربية، يرجى استخدام خيار <strong>"طباعة الفاتورة للعميل"</strong> وحفظها كملف PDF من نافذة الطباعة.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
