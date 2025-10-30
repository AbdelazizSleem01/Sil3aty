import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import ourTeam from "../../../../../../models/OutTeam";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/authOptions";

// get fun

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const teamMember = await ourTeam.findById(id);

    if (!teamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.formData();

    const name = data.get("name");
    const role = data.get("role");
    const comment = data.get("comment");
    const facebook = data.get("facebook");
    const twitter = data.get("twitter");
    const imageFile = data.get("image");

    const updateData = {
      name,
      role,
      comment,
      facebook: facebook || null,
      twitter: twitter || null,
    };

    if (imageFile) {
      const { uploadImages } = require("../../../../../../lib/cloudinary.js");
      const imageUrls = await uploadImages(imageFile);
      updateData.image = imageUrls[0];
    }

    const updatedTeamMember = await ourTeam.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedTeamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Team member updated successfully",
      data: updatedTeamMember,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update team member", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deletedTeamMember = await ourTeam.findByIdAndDelete(id);

    if (!deletedTeamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete team member", error: error.message },
      { status: 500 }
    );
  }
}
