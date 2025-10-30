// app/api/admin/update-role/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";
import User from "../../../../../models/User";

export async function PUT(req) {
  try {
    // Connect to the database
    await dbConnect();

    // Check if the requester is an admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user ID and new role from the request body
    const { userId, isAdmin } = await req.json();

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
