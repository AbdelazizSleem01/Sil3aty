import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../../lib/dbConnect";
import Product from "../../../../../../models/Product";
import Review from "../../../../../../models/Review";
import { authOptions } from "../../../../../../lib/authOptions";
import { sendNotificationToAdmins } from "../../../../../../lib/notificationHelper";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const reviews = await Review.find({ product: id })
      .sort({ createdAt: -1 })
      .populate("user", "name email profilePicture");

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching reviews", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { rating, comment } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json(
        { message: "Rating and comment are required" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: id,
      user: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create new review
    const newReview = new Review({
      product: id,
      user: session.user.id,
      name: session.user.name,
      rating,
      comment,
    });

    await newReview.save();

    const product = await Product.findById(id);
    const reviews = await Review.find({ product: id });

    product.numReviews = reviews.length;
    product.averageRating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    try {
      await sendNotificationToAdmins(
        `تم إضافة مراجعة جديدة على منتج "${product.name}" بواسطة ${session.user.name}`,
        `/admin/reviews`,
        "review",
        session.user.id,
        session.user.id
      );
    } catch (notificationError) {}

    return NextResponse.json(
      { message: "Review added successfully", review: newReview },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding review", error: error.message },
      { status: 500 }
    );
  }
}
