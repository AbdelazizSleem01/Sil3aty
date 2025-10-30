import { NextResponse } from "next/server";
import Brand from "../../../../../models/Brand";
import { uploadImages } from "../../../../../lib/cloudinary";
import dbConnect from "../../../../../lib/dbConnect";

dbConnect();

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const brand = await Brand.findById(resolvedParams.id);
    if (!brand)
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const logoFile = formData.get("logo");

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (logoFile) {
      const logoUrl = await uploadImages([logoFile]);
      brand.logo = logoUrl[0];
    }

    brand.name = name;
    brand.description = description;

    await brand.save();

    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update brand", message: error.message },
      { status: 500 }
    );
  }
}
// DELETE a brand
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
