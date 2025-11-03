import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import dbConnect from "../../../../../lib/dbConnect";
import Order from "../../../../../models/Order";
import Cart from "../../../../../models/Cart";
import { authOptions } from "../../../../../lib/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    // Fetch the user's cart
    const cart = await Cart.findOne({ user: session.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Calculate the total amount
    const amount = cart.items.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        userId: session.user.id.toString(),
        cartId: cart._id.toString(),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payment intent", details: error.message },
      { status: 500 }
    );
  }
}
