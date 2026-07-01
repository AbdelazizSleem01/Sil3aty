import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Category from "../../../../models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { uploadImages } from "../../../../lib/cloudinary";


export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const category = await Category.findOne({ slug }).populate("parent");
      if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
      return NextResponse.json(category, { status: 200 });
    }

    const categories = await Category.find().populate("parent");
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    let name, slug, parent, properties, image;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = formData.get("name");
      slug = formData.get("slug");
      parent = formData.get("parent") || undefined;
      properties = formData.get("properties") ? JSON.parse(formData.get("properties")) : undefined;

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
      parent = body.parent;
      properties = body.properties;
      image = body.image;
    }

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const newCategory = await Category.create({ name, slug, parent, properties, image });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
