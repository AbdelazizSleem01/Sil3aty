import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import Cart from "../../../../models/Cart";
import Product from "../../../../models/Product";
import Coupon from "../../../../models/Coupon";
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

    // Check if replica set is enabled to support transactions
    let isReplicaSet = false;
    try {
      const helloInfo = await mongoose.connection.db.command({ hello: 1 });
      isReplicaSet = !!helloInfo.setName;
    } catch (e) {
      try {
        const isMasterInfo = await mongoose.connection.db.command({ isMaster: 1 });
        isReplicaSet = !!isMasterInfo.setName;
      } catch (e2) {}
    }

    const executeOrderActions = async (sessionToUse) => {
      const subTotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      const cart = await Cart.findOne({ user: session.user.id })
        .session(sessionToUse);

      let discountAmount = 0;
      let discountCode = null;
      let couponId = null;

      console.log("Cart found:", cart);

      if (cart?.coupon) {
        // Fetch the full coupon details
        const coupon = await Coupon.findById(cart.coupon).session(sessionToUse);
        console.log("Found coupon details:", coupon);

        if (coupon) {
          discountCode = coupon.code;
          couponId = coupon._id;

          if (coupon.discountType === "percent") {
            discountAmount = Math.round((subTotal * coupon.amount) / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else if (coupon.discountType === "fixed") {
            discountAmount = coupon.amount;
          }
        }

        console.log("Applying coupon:", {
          code: discountCode,
          discountType: coupon.discountType,
          amount: coupon.amount,
          calculatedDiscount: discountAmount,
        });
      } else {
        console.log("No coupon found in cart");
      }

      const finalTotal = subTotal - discountAmount;

      for (const item of cartItems) {
        const product = await Product.findById(item.product._id).session(
          sessionToUse
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
          { session: sessionToUse }
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
        subTotal: subTotal,
        totalPrice: finalTotal,
        discountAmount: discountAmount,
        discountCode: discountCode,
        coupon: couponId,
        finalTotal: finalTotal,
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

      savedOrder = await order.save({ session: sessionToUse });

      await Cart.findOneAndDelete(
        { user: session.user.id },
        { session: sessionToUse }
      );

      const admins = await User.find({ isAdmin: true })
        .select("_id")
        .session(sessionToUse);
      const notification = new Notification({
        message: `New order placed by ${session.user.name}`,
        link: `/admin/orders/${savedOrder._id}`,
        recipients: admins.map((admin) => admin._id),
        type: "order",
        relatedUser: session.user.id,
      });
      await notification.save({ session: sessionToUse });

    };

    if (isReplicaSet) {
      await mongooseSession.withTransaction(async () => {
        await executeOrderActions(mongooseSession);
      });
    } else {
      await executeOrderActions(null);
    }

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
