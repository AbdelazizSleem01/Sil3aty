import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Product from "../../../../../models/Product";
import Brand from "../../../../../models/Brand";
import Review from "../../../../../models/Review";

export async function GET() {
  try {
    await dbConnect();

    const featuredProducts = await Product.find({ isFeatured: true })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    // جلب التقييمات لكل منتج
    const productsWithReviews = await Promise.all(
      featuredProducts.map(async (product) => {
        const reviews = await Review.find({ product: product._id });

        const numReviews = reviews.length;
        const averageRating =
          numReviews > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) /
              numReviews
            : 0;

        const hasDiscount =
          product.isOnSale &&
          product.discountPrice &&
          product.discountPrice < product.price;

        const discountPercentage = hasDiscount
          ? Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            )
          : 0;

        return {
          ...product,
          isDiscounted: hasDiscount,
          discountPercentage,
          numReviews,
          averageRating,
        };
      })
    );

    return NextResponse.json(productsWithReviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
