import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../../lib/dbConnect";
import AboutUs from "../../../../../../models/AboutUs";
import { authOptions } from "../../../../../../lib/authOptions";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const aboutUs = await AboutUs.findByIdAndUpdate(
      id,
      {
        ...body,
        lastUpdatedBy: session.user.id,
      },
      { new: true, runValidators: true }
    );

    if (!aboutUs) {
      return NextResponse.json(
        { error: "About us content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(aboutUs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update about us content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const aboutUs = await AboutUs.findByIdAndDelete(id);

    if (!aboutUs) {
      return NextResponse.json(
        { error: "About us content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "About us content deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete about us content" },
      { status: 500 }
    );
  }
}
