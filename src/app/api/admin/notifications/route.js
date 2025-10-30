import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import Notification from "../../../../../models/Notification";
import dbConnect from "../../../../../lib/dbConnect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  try {
    const notifications = await Notification.find({
      recipients: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedUser", "name profilePicture")
      .populate("relatedAdmin", "name profilePicture")
      .populate("createdBy", "name profilePicture");

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationId } = await req.json();

  await dbConnect();

  try {
    await Notification.findByIdAndUpdate(notificationId, {
      $addToSet: { readBy: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark notification as read", details: error.message },
      { status: 500 }
    );
  }
}
