import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import Cart from "../../../../models/Cart";
import Product from "../../../../models/Product";
import Notification from "../../../../models/Notification";
import mongoose from "mongoose";
import User from "../../../../models/User";
import { nanoid } from "nanoid";

function calculateEstimatedDelivery() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  return deliveryDate;
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const orders = await Order.find({ user: session.user.id }).sort({
    createdAt: -1,
  });

  return NextResponse.json(orders);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const mongooseSession = await mongoose.startSession();
  let savedOrder;

  try {
    const { shippingAddress, cartItems } = await request.json();

    if (!shippingAddress || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    await mongooseSession.withTransaction(async () => {
      const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      for (const item of cartItems) {
        const product = await Product.findById(item.product._id).session(
          mongooseSession
        );
        if (!product) throw new Error(`Product ${item.product._id} not found`);
        if (product.countInStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      for (const item of cartItems) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { countInStock: -item.quantity } },
          { session: mongooseSession }
        );
      }

      const order = new Order({
        user: session.user.id,
        orderItems: cartItems.map((item) => ({
          name: item.product.name,
          qty: item.quantity,
          image: item.product.images?.[0] || "",
          price: item.product.price,
          product: item.product._id,
          size: item.size,
          color: item.color,
        })),
        totalPrice: totalPrice,
        paymentMethod: "cash_on_delivery",
        shippingAddress: shippingAddress,
        isPaid: false,
        tracking: {
          number: `Sil3aty-${nanoid(8).toUpperCase()}`,
          carrier: "USPS",
          status: "processing",
          estimatedDelivery: calculateEstimatedDelivery(),
          lastUpdated: new Date(),
        },
      });

      savedOrder = await order.save({ session: mongooseSession });

      await Cart.findOneAndDelete(
        { user: session.user.id },
        { session: mongooseSession }
      );

      const admins = await User.find({ isAdmin: true })
        .select("_id")
        .session(mongooseSession);
      const notification = new Notification({
        message: `New order placed by ${session.user.name}`,
        link: `/admin/orders/${savedOrder._id}`,
        recipients: admins.map((admin) => admin._id),
        type: "order",
        relatedUser: session.user.id,
      });
      await notification.save({ session: mongooseSession });
    });

    return NextResponse.json(savedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  } finally {
    await mongooseSession.endSession();
  }
}
