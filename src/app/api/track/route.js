import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import mongoose from "mongoose";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trackingNumber = searchParams.get("number");

  if (!trackingNumber) {
    return NextResponse.json(
      { error: "Tracking number is required" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const query = {
      $or: [{ "tracking.number": trackingNumber }],
    };

    if (mongoose.isValidObjectId(trackingNumber)) {
      query.$or.push({ _id: trackingNumber });
    }

    const order = await Order.findOne(query)
      .populate("user", "name email")
      .populate("orderItems.product", "name images price");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const history = generateTrackingHistory(order);

    const responseData = {
      order: {
        id: order._id,
        createdAt: order.createdAt,
        status: order.status,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
      },
      tracking: {
        number: order.tracking?.number || order._id.toString(),
        carrier: order.tracking?.carrier || "Standard Shipping",
        status: order.tracking?.status || order.status,
        estimatedDelivery:
          order.tracking?.estimatedDelivery ||
          calculateEstimatedDelivery(order.createdAt),
        history: history,
        url: order.tracking?.url || null,
      },
      items: order.orderItems,
      customer: order.user,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to track order", details: error.message },
      { status: 500 }
    );
  }
}

function generateTrackingHistory(order) {
  const history = [
    {
      date: order.createdAt,
      status: "Order placed",
      location: "Online store",
      details: "Your order has been received",
    },
  ];

  if (order.status !== "pending") {
    history.push({
      date: order.paidAt || new Date(order.createdAt.getTime() + 3600000),
      status: "Payment processed",
      location: "Payment system",
      details: "Payment has been confirmed",
    });

    history.push({
      date: order.processedAt || new Date(order.createdAt.getTime() + 86400000),
      status: "Processing",
      location: "Warehouse",
      details: "Your order is being prepared for shipment",
    });
  }

  if (order.status === "shipped" || order.status === "delivered") {
    history.push({
      date: order.shippedAt || new Date(order.createdAt.getTime() + 172800000),
      status: "Shipped",
      location: "Distribution center",
      details: `Shipped via ${order.tracking?.carrier || "Standard Shipping"}`,
    });
  }

  if (order.status === "delivered") {
    history.push({
      date:
        order.deliveredAt || new Date(order.createdAt.getTime() + 259200000),
      status: "Delivered",
      location: order.shippingAddress?.city || "Destination",
      details: "Package has been delivered",
    });
  }

  return history;
}

function calculateEstimatedDelivery(orderDate) {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  return deliveryDate;
}
