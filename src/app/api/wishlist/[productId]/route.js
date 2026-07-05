import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import dbConnect from "../../../../../lib/dbConnect";
import Wishlist from "../../../../../models/Wishlist";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await params;
    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    await dbConnect();

    await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $pull: { products: productId } },
      { new: true }
    );

    return NextResponse.json({ message: "Product removed from wishlist successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
