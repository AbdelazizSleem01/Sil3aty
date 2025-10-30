// app/api/admin/subscribers/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import Subscription from "../../../../../../models/Subscription";

export async function DELETE(request, { params }) {
  await dbConnect();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Subscriber ID is required" },
      { status: 400 }
    );
  }

  try {
    const deletedSubscriber = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Subscriber deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
