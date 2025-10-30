import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Cart from "../../../../../models/Cart";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching cart count", error: error.message },
      { status: 500 }
    );
  }
}
