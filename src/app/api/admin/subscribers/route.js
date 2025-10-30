import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Subscription from "../../../../../models/Subscription";

export async function GET() {
  await dbConnect();

  try {
    const subscribers = await Subscription.find({}).sort({ createdAt: -1 });
    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
