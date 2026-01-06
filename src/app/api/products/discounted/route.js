import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Product from "../../../../../models/Product";
import Category from "../../../../../models/Category";
import Brand from "../../../../../models/Brand";
import Review from "../../../../../models/Review";

export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();

    const discountedProducts = await Product.find({
      isOnSale: true,
      discountPrice: { $exists: true, $gt: 0 },
      $or: [
        { discountStartDate: { $lte: now }, discountEndDate: { $gte: now } },
        { discountStartDate: null, discountEndDate: null }
      ]
    })
      .populate("category", "name")
      .populate("brand", "name")
      .limit(6)
      .lean();

    if (!discountedProducts || discountedProducts.length === 0) {
      const response = NextResponse.json([]);
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
      return response;
    }

    const productsWithReviews = await Promise.all(
      discountedProducts.map(async (product) => {
        try {
          const reviews = await Review.find({ product: product._id }).lean();

          const numReviews = reviews.length;
          const averageRating =
            numReviews > 0
              ? reviews.reduce((acc, review) => acc + (review.rating || 0), 0) /
                numReviews
              : 0;

          const discountPercentage =
            product.discountPercentage ||
            (product.price && product.discountPrice
              ? Math.round(
                  ((product.price - product.discountPrice) / product.price) *
                    100
                )
              : 0);

          return {
            ...product,
            discountPercentage,
            numReviews,
            averageRating,
          };
        } catch (reviewError) {
          // If review fetch fails, return product without reviews
          return {
            ...product,
            discountPercentage: product.discountPercentage || 0,
            numReviews: 0,
            averageRating: 0,
          };
        }
      })
    );

    const response = NextResponse.json(productsWithReviews);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch discounted products", details: error.message },
      { status: 500 }
    );
  }
}
