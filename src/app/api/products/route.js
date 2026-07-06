import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../models/Product";
import User from "../../../../models/User";
import { uploadImages } from "../../../../lib/cloudinary";
import Notification from "../../../../models/Notification";
import Brand from "../../../../models/Brand";
import Review from "../../../../models/Review";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  try {
    const query = {};
    if (category) query.category = category;

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name logo")
      .lean();

    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ product: product._id });

        const numReviews = reviews.length;
        const averageRating =
          numReviews > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) /
              numReviews
            : 0;

        return {
          ...product,
          images: product.images || [],
          numReviews,
          averageRating,
        };
      })
    );

    return NextResponse.json(productsWithReviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching products", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("images");
    const imageUrls = files.length > 0 ? await uploadImages(files) : [];
    const body = Object.fromEntries(formData.entries());

    const sizes = Array.isArray(body.sizes)
      ? body.sizes
      : body.sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean);

    const colors = Array.isArray(body.colors)
      ? body.colors
      : body.colors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean);

    const productData = {
      ...body,
      images: imageUrls,
      sizes,
      colors,
    };

    const overrideFields = [
      "priceEGP", "priceSAR", "priceAED",
      "discountPriceEGP", "discountPriceSAR", "discountPriceAED"
    ];
    overrideFields.forEach(field => {
      if (productData[field] === "" || productData[field] === undefined || productData[field] === null) {
        delete productData[field];
      } else {
        const val = parseFloat(productData[field]);
        if (!isNaN(val)) {
          productData[field] = val;
        } else {
          delete productData[field];
        }
      }
    });

    const newProduct = new Product(productData);

    await newProduct.save();

    try {
      const admins = await User.find({
        isAdmin: true,
        _id: { $ne: session.user.id },
      }).select("_id");

      if (admins.length > 0) {
        const notification = new Notification({
          message: `New product created by ${session.user.name}`,
          link: `/product/${newProduct._id}`,
          recipients: admins.map((admin) => admin._id),
          type: "product",
          createdAt: new Date(),
          relatedAdmin: session.user.id,
        });
        await notification.save();
      }
    } catch (notificationError) {}

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating product", error: error.message },
      { status: 500 }
    );
  }
}
