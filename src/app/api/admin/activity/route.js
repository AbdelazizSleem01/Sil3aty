import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import Order from "../../../../../models/Order";
import Contact from "../../../../../models/Contact";

export async function GET() {
  try {
    await dbConnect();

    const [recentUsers, recentOrders, recentMessages] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt"),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id totalPrice status createdAt"),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email subject createdAt"),
    ]);

    return NextResponse.json(
      {
        users: recentUsers,
        orders: recentOrders,
        messages: recentMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
