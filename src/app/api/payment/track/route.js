import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import Order from "../../../../../models/Order";
import dbConnect from "../../../../../lib/dbConnect";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const orders = await Order.find({ user: session.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch payment tracking data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
