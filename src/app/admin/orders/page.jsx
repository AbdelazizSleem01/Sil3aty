"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        setError("Failed to fetch orders. Please try again.");
        toast.error("Failed to fetch orders");
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
      toast.success(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("❌ Failed to update order status");
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
      toast.success(`✅ Order marked as ${isPaid ? "paid" : "unpaid"}`);
    } catch (error) {
      toast.error("❌ Failed to update payment status");
    }
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [59, 130, 246];
    const secondaryColor = [107, 114, 128];
    const successColor = [34, 197, 94];
    const warningColor = [245, 158, 11];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Sil3aty STORE", 15, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", 180, 18, { align: "right" });

    doc.setFontSize(8);
    doc.text("https://sil3aty.vercel.app/", 15, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 180, 25, {
      align: "right",
    });

    doc.setFillColor(249, 250, 251);
    doc.rect(15, 40, 180, 25, "F");
    doc.setDrawColor(229, 231, 235);
    doc.rect(15, 40, 180, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER INFORMATION", 20, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Invoice #: Sil3aty-${order._id.substring(18).toUpperCase()}`,
      20,
      53
    );
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      20,
      58
    );

    doc.text(`Status: ${order.status.toUpperCase()}`, 100, 53);
    doc.text(`Payment: ${order.isPaid ? "PAID" : "PENDING"}`, 100, 58);

    if (order.isPaid && order.paidAt) {
      doc.text(
        `Paid On: ${new Date(order.paidAt).toLocaleDateString()}`,
        150,
        53
      );
    }

    const customerInfo = [
      [
        {
          content: "BILL TO",
          styles: {
            fontStyle: "bold",
            fontSize: 9,
            fillColor: primaryColor,
            textColor: 255,
          },
        },
        {
          content: "SHIP TO",
          styles: {
            fontStyle: "bold",
            fontSize: 9,
            fillColor: primaryColor,
            textColor: 255,
          },
        },
      ],
      [
        `${order.shippingAddress?.firstName || ""} ${
          order.shippingAddress?.lastName || ""
        }\n${order.shippingAddress?.email || ""}\n${
          order.shippingAddress?.phone || ""
        }`,
        `${order.shippingAddress?.address || ""}\n${
          order.shippingAddress?.city || ""
        }, ${order.shippingAddress?.country || ""}\nPostal: ${
          order.shippingAddress?.postalCode || ""
        }`,
      ],
    ];

    autoTable(doc, {
      startY: 75,
      head: customerInfo.slice(0, 1),
      body: customerInfo.slice(1),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 95, fontStyle: "normal" },
        1: { cellWidth: 95, fontStyle: "normal" },
      },
      margin: { left: 15, right: 15 },
    });

    const tableColumn = ["Product", "Color/Size", "Price", "Qty", "Total"];
    const tableRows = order.orderItems.map((item) => [
      item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name,
      `${item.color || "N/A"} / ${item.size || "N/A"}`,
      `$${item.price.toFixed(2)}`,
      item.qty.toString(),
      `$${(item.price * item.qty).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
      },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(249, 250, 251);
    doc.rect(120, finalY, 75, 30, "F");
    doc.setDrawColor(229, 231, 235);
    doc.rect(120, finalY, 75, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ORDER SUMMARY", 125, finalY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Subtotal: $${order.subTotal?.toFixed(2) || order.totalPrice.toFixed(2)}`,
      125,
      finalY + 14
    );

    if (order.discountAmount > 0) {
      doc.setTextColor(...successColor);
      doc.text(
        `Discount (${order.discountCode}): -$${order.discountAmount.toFixed(
          2
        )}`,
        125,
        finalY + 19
      );
      doc.setTextColor(0, 0, 0);
    }

    if (order.shippingCost > 0) {
      doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`, 125, finalY + 24);
    } else {
      doc.text(`Shipping: $0.00`, 125, finalY + 24);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text(
      `TOTAL: $${(order.finalTotal || order.totalPrice).toFixed(2)}`,
      125,
      finalY + 29
    );

    // Footer
    const footerY = 270;

    doc.setDrawColor(229, 231, 235);
    doc.line(15, footerY, 195, footerY);

    doc.setFontSize(7);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for shopping with Sil3aty Store!", 15, footerY + 5);
    doc.text(
      "For questions: support@Sil3aty-store.com | +20 1012105407",
      15,
      footerY + 10
    );
    doc.text(
      "Terms: All sales are final. Returns subject to return policy.",
      15,
      footerY + 15
    );

    const fileName = `Sil3aty-Invoice-${order._id
      .substring(18)
      .toUpperCase()}.pdf`;
    doc.save(fileName);
    toast.success("📄 Invoice downloaded successfully!");
  };

  const generateCompactInvoice = (order) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 150],
    });

    const primaryColor = [59, 130, 246];
    const secondaryColor = [107, 114, 128];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 80, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Sil3aty", 5, 7);
    doc.text("INVOICE", 65, 7, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(`Order: ${order._id.substring(18).toUpperCase()}`, 5, 16);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 5, 20);
    doc.text(`Status: ${order.status}`, 40, 16);
    doc.text(`Paid: ${order.isPaid ? "Yes" : "No"}`, 40, 20);

    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER:", 5, 28);
    doc.setFont("helvetica", "normal");
    const customerName = `${order.shippingAddress?.firstName || ""} ${
      order.shippingAddress?.lastName || ""
    }`;
    doc.text(customerName, 5, 32);
    doc.text(order.shippingAddress?.phone || "", 5, 36);

    doc.setDrawColor(...secondaryColor);
    doc.line(5, 42, 75, 42);

    doc.setFont("helvetica", "bold");
    doc.text("PRICE DETAILS:", 5, 46);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Subtotal: $${order.subTotal?.toFixed(2) || order.totalPrice.toFixed(2)}`,
      5,
      50
    );

    let yOffset = 54;
    if (order.discountCode) {
      doc.setTextColor(...successColor);
      doc.text(
        `Discount (${order.discountCode}): -$${
          order.discountAmount?.toFixed(2) || "0.00"
        }`,
        5,
        yOffset
      );
      doc.setTextColor(0, 0, 0);
      yOffset += 4;
    }

    if (order.shippingCost > 0) {
      doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`, 5, yOffset);
      yOffset += 4;
    }

    doc.setFont("helvetica", "bold");
    doc.text(
      `Final Total: $${(order.finalTotal || order.totalPrice).toFixed(2)}`,
      5,
      yOffset + 4
    );

    doc.setFont("helvetica", "bold");
    doc.text("ITEMS", 5, 46);
    doc.text("QTY", 45, 46);
    doc.text("TOTAL", 60, 46);

    doc.line(5, 48, 75, 48);

    let yPos = 52;
    order.orderItems.forEach((item, index) => {
      if (index < 4) {
        const itemName =
          item.name.length > 20
            ? item.name.substring(0, 20) + "..."
            : item.name;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.text(itemName, 5, yPos);
        doc.text(item.qty.toString(), 48, yPos);
        doc.text(`$${(item.price * item.qty).toFixed(2)}`, 62, yPos);
        yPos += 4;
      }
    });

    doc.setDrawColor(...secondaryColor);
    doc.line(5, yPos + 2, 75, yPos + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("TOTAL AMOUNT", 5, yPos + 8);
    doc.text(`$${order.totalPrice.toFixed(2)}`, 62, yPos + 8);

    doc.setFontSize(4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("Thank you for your purchase!", 40, yPos + 15, {
      align: "center",
    });
    doc.text("https://sil3aty.vercel.app/", 40, yPos + 18, {
      align: "center",
    });

    const fileName = `Compact-Invoice-${order._id
      .substring(18)
      .toUpperCase()}.pdf`;
    doc.save(fileName);
    toast.success("📄 Compact invoice downloaded!");
  };

  const printInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order._id.substring(18).toUpperCase()}</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .no-print { display: none !important; }
          }
          .invoice-header { 
            background: #3b82f6; 
            color: white; 
            padding: 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .invoice-details { 
            background: #f8fafc; 
            padding: 15px; 
            border: 1px solid #e2e8f0;
          }
          .items-table {
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          .items-table th {
            background: #3b82f6;
            color: white;
            padding: 8px;
            text-align: left;
          }
          .items-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .total-section {
            background: #1e40af;
            color: white;
            padding: 15px;
            text-align: right;
            border-radius: 0 0 8px 8px;
          }
          .customer-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="invoice-header">
            <h1>Sil3aty STORE</h1>
            <p>INVOICE</p>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <div>
                <h3>Bill To:</h3>
                <p>${order.shippingAddress?.firstName} ${
      order.shippingAddress?.lastName
    }</p>
                <p>${order.shippingAddress?.email}</p>
                <p>${order.shippingAddress?.phone}</p>
              </div>
              <div>
                <h3>Order Details:</h3>
                <p><strong>Invoice #:</strong> Sil3aty-${order._id
                  .substring(18)
                  .toUpperCase()}</p>
                <p><strong>Date:</strong> ${new Date(
                  order.createdAt
                ).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment:</strong> ${
                  order.isPaid ? "Paid" : "Pending"
                }</p>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Details</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.color || "N/A"} / ${item.size || "N/A"}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.qty}</td>
                  <td>$${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-section">
            <h2>TOTAL: $${order.totalPrice.toFixed(2)}</h2>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Thank you for shopping with Sil3aty Store!</p>
            <p>https://sil3aty.vercel.app/ | support@Sil3aty-store.com</p>
          </div>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Invoice
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

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
              Access Denied!
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to view this page
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary btn-outline"
            >
              Go Back
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
            <Package className="animate-pulse" /> Loading Orders...
          </h1>
          <p className="text-gray-500 mb-4">Fetching your order data</p>
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
              Error Loading Orders!
            </h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToExcel}
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-2xl shadow-lg border border-gray-300">
            <div className="stat-figure text-primary">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="stat-title">Total Orders</div>
            <div className="stat-value text-2xl">{stats.total}</div>
          </div>

          <div className="stat bg-base-100 rounded-2xl shadow-lg border border-gray-300">
            <div className="stat-figure text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-title">Paid Orders</div>
            <div className="stat-value text-2xl">{stats.paid}</div>
          </div>

          <div className="stat bg-base-100 rounded-2xl shadow-lg border border-gray-300">
            <div className="stat-figure text-warning">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-title">Pending</div>
            <div className="stat-value text-2xl">{stats.pending}</div>
          </div>

          <div className="stat bg-base-100 rounded-2xl shadow-lg border border-gray-300">
            <div className="stat-figure text-info">
              <Truck className="w-6 h-6" />
            </div>
            <div className="stat-title">Delivered</div>
            <div className="stat-value text-2xl">{stats.delivered}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card bg-base-100 shadow-lg border border-gray-300">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="input input-border border-gray-300ed flex items-center gap-2 shadow-sm">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="grow"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select select-border border-gray-300ed shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="select select-border border-gray-300ed shadow-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="card-title text-2xl text-gray-500 mb-2">
                No orders found
              </h2>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="btn btn-primary gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map((order) => (
              <div
                key={order._id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-300"
              >
                <div className="card-body">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-gray-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Hash className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          Order #{order._id.substring(18).toUpperCase()}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2">
                        {order.discountCode && (
                          <div className="badge badge-lg badge-success gap-1">
                            <span>كوبون: {order.discountCode}</span>
                            {order.discountAmount > 0 && (
                              <span>(-${order.discountAmount.toFixed(2)})</span>
                            )}
                          </div>
                        )}
                        <div
                          className={`badge badge-lg ${getStatusColor(
                            order.status
                          )} gap-1`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        <div
                          className={`badge badge-lg ${
                            order.isPaid ? "badge-success" : "badge-error"
                          } gap-1`}
                        >
                          {order.isPaid ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer and Shipping */}
                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Customer Details
                          </h3>
                          <p className="text-gray-600">
                            {order.shippingAddress?.firstName}{" "}
                            {order.shippingAddress?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress?.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Shipping Address
                          </h3>
                          <p className="text-gray-600">
                            {order.shippingAddress?.address}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.country}
                          </p>
                          <p className="text-sm text-gray-500">
                            Postal Code: {order.shippingAddress?.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order Items ({order.orderItems.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr className="bg-base-200">
                            <th>Product</th>
                            <th>Details</th>
                            <th className="text-right">Price</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((item) => (
                            <tr
                              key={item._id}
                              className="hover:bg-base-200/50 transition-colors"
                            >
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="avatar">
                                    <div className="w-12 h-12 rounded-lg border border-gray-300">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="object-cover"
                                      />
                                    </div>
                                  </div>
                                  <div className="font-medium">{item.name}</div>
                                </div>
                              </td>
                              <td>
                                <div className="flex gap-2">
                                  {item.color && (
                                    <div className="flex items-center gap-1">
                                      <div
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      <span className="text-xs">
                                        {item.color}
                                      </span>
                                    </div>
                                  )}
                                  {item.size && (
                                    <span className="badge badge-outline badge-sm">
                                      {item.size}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-right font-semibold">
                                ${item.price.toFixed(2)}
                              </td>
                              <td className="text-center">
                                <span className="font-semibold">
                                  {item.qty}
                                </span>
                              </td>
                              <td className="text-right font-bold text-primary">
                                ${(item.price * item.qty).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Coupon Information */}
                    {order.discountCode && (
                      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                        <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                          <span>معلومات الكوبون</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>كود الكوبون:</span>
                            <span className="font-bold">
                              {order.discountCode}
                            </span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-success">
                              <span>قيمة الخصم:</span>
                              <span className="font-bold">
                                ${order.discountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="p-4 bg-base-200 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>تفاصيل السعر</span>
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>السعر الأصلي:</span>
                          <span className="font-bold">
                            $
                            {order.subTotal?.toFixed(2) ||
                              order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-success">
                            <span>الخصم:</span>
                            <span className="font-bold">
                              -${order.discountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between items-center">
                            <span>تكلفة الشحن:</span>
                            <span className="font-bold">
                              ${order.shippingCost.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between items-center font-bold text-primary">
                            <span>السعر النهائي:</span>
                            <span>
                              $
                              {(order.finalTotal || order.totalPrice).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6 p-4 bg-base-200/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      تفاصيل الطلب
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">إجمالي المنتجات:</span>
                        <span className="font-medium">
                          $
                          {order.subTotal?.toFixed(2) ||
                            order.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-success font-medium">
                          <span>Discount ({order.discountCode}):</span>
                          <span>-${order.discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      {order.shippingCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>${order.shippingCost.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold pt-2 border-t border-gray-300 text-lg">
                        <span>Final Total:</span>
                        <span className="text-primary">
                          ${(order.finalTotal || order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Controls */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-4 border-t border-gray-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-primary" />
                      <span className="text-xl font-bold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary ml-2">
                        ${(order.finalTotal || order.totalPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="dropdown dropdown-top">
                        <label
                          tabIndex={0}
                          className="btn btn-primary whitespace-nowrap  btn-sm gap-2 hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          <FileText className="w-4 h-4" />
                          Invoice Options
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
                        >
                          <li>
                            <a
                              onClick={() => generateInvoicePDF(order)}
                              className="cursor-pointer"
                            >
                              📄 Standard PDF
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => generateCompactInvoice(order)}
                              className="cursor-pointer"
                            >
                              📦 Compact PDF
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => printInvoice(order)}
                              className="cursor-pointer"
                            >
                              🖨️ Print Version
                            </a>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() =>
                          handlePaymentStatusChange(order._id, !order.isPaid)
                        }
                        className={`btn btn-sm gap-2 ${
                          order.isPaid ? "btn-error" : "btn-success"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        {order.isPaid ? "Mark Unpaid" : "Mark Paid"}
                      </button>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="select select-bordered select-sm"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </div>

            <div className="join">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="join-item btn btn-sm"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="join-item btn btn-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`join-item btn btn-sm ${
                      currentPage === pageNum ? "btn-primary" : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="join-item btn btn-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="join-item btn btn-sm"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
