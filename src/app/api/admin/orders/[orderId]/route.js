import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/authOptions";
import dbConnect from "../../../../../../lib/dbConnect";
import Order from "../../../../../../models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Unwrap params
    const { orderId } = await params;

    if (!orderId || orderId.length !== 24) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve order", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { orderId } = await params;
    const updateData = await request.json();

    // السماح بتحديث الحقول المصرح بها فقط
    const allowedUpdates = ["status", "isPaid"];
    const updates = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // إذا تم تحديث حالة الدفع إلى مدفوع، أضف تاريخ الدفع
    if (updates.isPaid === true) {
      updates.paidAt = new Date();
    } else if (updates.isPaid === false) {
      updates.paidAt = null;
    }

    const order = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

// Delete
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { orderId } = await params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}
