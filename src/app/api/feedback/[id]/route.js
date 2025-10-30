import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Feedback from "../../../../../models/Feedback";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    if (feedback.imageUrl) {
      try {
        await del(feedback.imageUrl);
      } catch (err) {}
    }

    await Feedback.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Feedback deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
