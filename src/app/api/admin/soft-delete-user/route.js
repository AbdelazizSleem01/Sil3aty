import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";
import User from "../../../../../models/User";

export async function PUT(req) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.status = "inactive";
    await user.save();

    return NextResponse.json(
      { message: "User disabled successfully", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
