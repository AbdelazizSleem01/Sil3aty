// app/api/admin/subscribe/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Subscription from "../../../../../models/Subscription";

export async function GET(request) {
  await dbConnect();

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Invalid verification link" },
      { status: 400 }
    );
  }

  try {
    const subscriber = await Subscription.findOne({ verifyToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    // Mark as verified
    subscriber.verified = true;
    subscriber.verifyToken = undefined; // Clear the token
    await subscriber.save();

    return NextResponse.json(
      { message: "Email verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
