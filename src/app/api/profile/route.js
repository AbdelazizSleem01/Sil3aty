import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/dbConnect";
import { authOptions } from "../../../../lib/authOptions";
import User from "../../../../models/User";
import { uploadImages } from "../../../../lib/cloudinary";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const user = await User.findById(session.user.id).select("-password");
  return NextResponse.json(user, { status: 200 });
}

export async function PUT(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, name, email, newPassword, confirmPassword } =
      await req.json();
    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required for password change" },
          { status: 400 }
        );
      }

      const trimmedCurrent =
        typeof currentPassword === "string" ? currentPassword.trim() : "";

      const isValid = await user.matchPassword(trimmedCurrent);
      if (!isValid) {
        return NextResponse.json(
          {
            error:
              "Invalid current password. If you cannot remember your password, please use the password reset flow.",
          },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 400 }
        );
      }

      user.password = newPassword;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    return NextResponse.json(
      {
        ...updatedUser.toObject(),
        passwordUpdated: Boolean(newPassword),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadedUrls = await uploadImages([
      {
        buffer,
        mimetype: file.type,
        originalname: file.name,
      },
    ]);

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { profilePicture: uploadedUrls[0] },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedUser = await User.findByIdAndDelete(session.user.id);

  if (!deletedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Account deleted successfully" },
    { status: 200 }
  );
}
