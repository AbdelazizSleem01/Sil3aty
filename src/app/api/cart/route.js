import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../lib/dbConnect";
import { authOptions } from "../../../../lib/authOptions";
import Cart from "../../../../models/Cart";
import Product from "../../../../models/Product";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const cart = await Cart.findOne({ user: session.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }

    const total = cart.items.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);

    return NextResponse.json({ items: cart.items, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error.message },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, quantity, size, color } = await req.json();

    if (!productId || !quantity || !size || !color) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.countInStock < quantity) {
      return NextResponse.json(
        {
          message: `Only ${product.countInStock} items available in stock`,
          maxQuantity: product.countInStock,
        },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      model: Product,
    });

    const total = populatedCart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    return NextResponse.json(
      { items: populatedCart.items, total },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding to cart", error: error.message },
      { status: 500 }
    );
  }
}
