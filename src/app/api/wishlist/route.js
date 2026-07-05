import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import dbConnect from "../../../../lib/dbConnect";
import Wishlist from "../../../../models/Wishlist";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import Brand from "../../../../models/Brand";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate({
        path: "products",
        populate: [
          { path: "category" },
          { path: "brand", select: "name" }
        ]
      });

    if (!wishlist) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    return NextResponse.json({ products: wishlist.products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    await dbConnect();

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        products: [productId]
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    return NextResponse.json({ message: "Product added to wishlist successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
