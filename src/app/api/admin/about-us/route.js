import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import AboutUs from "../../../../../models/AboutUs";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";

export async function GET() {
  try {
    await dbConnect();
    const aboutUs = await AboutUs.findOne({ isActive: true });

    if (!aboutUs) {
      const defaultAboutUs = new AboutUs();
      await defaultAboutUs.save();
      return NextResponse.json(defaultAboutUs);
    }

    return NextResponse.json(aboutUs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch about us content" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const aboutUs = new AboutUs({
      ...body,
      lastUpdatedBy: session.user.id,
    });

    await aboutUs.save();
    return NextResponse.json(aboutUs, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create about us content" },
      { status: 500 }
    );
  }
}
