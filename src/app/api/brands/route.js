import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Brand from "../../../../models/Brand";
import Category from "../../../../models/Category";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { uploadImages } from "../../../../lib/cloudinary";

export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({});
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const logoFile = formData.get("logo");

    if (!name || !description || !logoFile) {
      return NextResponse.json(
        { error: "Name, description, and logo are required" },
        { status: 400 }
      );
    }

    const logoUrl = await uploadImages([logoFile]);

    const newBrand = new Brand({
      name,
      description,
      logo: logoUrl[0],
    });

    await newBrand.save();

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating brand", error: error.message },
      { status: 500 }
    );
  }
}
