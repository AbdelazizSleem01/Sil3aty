import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";
import Cart from "../../../../../models/Cart";

export async function PUT(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    const { quantity, size, color } = await req.json();

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    if (quantity !== undefined) {
      item.quantity = quantity;
    }
    if (size !== undefined) {
      item.size = size;
    }
    if (color !== undefined) {
      item.color = color;
    }

    await cart.save();

    return NextResponse.json(cart.items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating cart item", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    cart.items.pull(itemId);
    await cart.save();

    return NextResponse.json(cart.items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error removing cart item", error: error.message },
      { status: 500 }
    );
  }
}
