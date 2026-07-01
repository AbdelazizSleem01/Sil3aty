import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Category from "../../../../../models/Category";
import { uploadImages } from "../../../../../lib/cloudinary";

// Fetch a single category by ID
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a category by ID
export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    let name, slug, image;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = formData.get("name");
      slug = formData.get("slug");

      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const uploaded = await uploadImages([imageFile]);
        image = uploaded[0];
      } else {
        image = formData.get("image") || "";
      }
    } else {
      const body = await req.json();
      name = body.name;
      slug = body.slug;
      image = body.image;
    }

    // Validate fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, slug, image },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a category by ID
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } =await params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}