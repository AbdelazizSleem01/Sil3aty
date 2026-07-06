import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../lib/dbConnect";
import Product from "../../../../../models/Product";
import Review from "../../../../../models/Review";
import { authOptions } from "../../../../../lib/authOptions";
import { uploadImages } from "../../../../../lib/cloudinary";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;


  try {
    const product = await Product.findById(id)
      .populate("category")
      .populate("brand", "name");

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const reviews = await Review.find({ product: id })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews
        : 0;

    const productWithReviews = {
      ...product.toObject(),
      numReviews,
      averageRating,
      reviews: reviews.slice(0, 5),
    };

    return NextResponse.json(productWithReviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching product", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const formData = await req.formData();

    const currentImages = formData.get("existingImages")
      ? JSON.parse(formData.get("existingImages"))
      : [];

    const imageFields = formData.getAll("images");
    const newImageFiles = imageFields.filter((f) => f instanceof File);
    const newImageUrls =
      newImageFiles.length > 0 ? await uploadImages(newImageFiles) : [];

    const finalImages = [...currentImages, ...newImageUrls];

    const body = Object.fromEntries(formData.entries());

    const updatedData = {
      ...body,
      images: finalImages,
      mainImage: body.mainImage || (finalImages.length > 0 ? finalImages[0] : null),
      sizes:
        body.sizes
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      colors:
        body.colors
          ?.split(",")
          .map((c) => c.trim())
          .filter(Boolean) || [],
    };

    const overrideFields = [
      "priceEGP", "priceSAR", "priceAED",
      "discountPriceEGP", "discountPriceSAR", "discountPriceAED"
    ];
    overrideFields.forEach(field => {
      if (updatedData[field] === "" || updatedData[field] === undefined || updatedData[field] === null) {
        // Set to null so mongoose clears it in the database
        updatedData[field] = null;
      } else {
        const val = parseFloat(updatedData[field]);
        if (!isNaN(val)) {
          updatedData[field] = val;
        } else {
          updatedData[field] = null;
        }
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating product", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting product", error: error.message },
      { status: 500 }
    );
  }
}
