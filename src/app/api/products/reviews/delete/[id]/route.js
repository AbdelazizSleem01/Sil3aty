import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../../../lib/dbConnect";
import Review from "../../../../../../../models/Review";
import Product from "../../../../../../../models/Product";
import { authOptions } from "../../../../../../../lib/authOptions";
import User from "../../../../../../../models/User";

export async function DELETE(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    const isAdmin = user?.role === "admin";

    if (review.user.toString() !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { message: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);

    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);

    if (reviews.length > 0) {
      product.numReviews = reviews.length;
      product.averageRating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    } else {
      product.numReviews = 0;
      product.averageRating = 0;
    }

    await product.save();

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting review", error: error.message },
      { status: 500 }
    );
  }
}