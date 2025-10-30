// src/app/api/products/related/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Product from "../../../../../models/Product";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const exclude = searchParams.get("exclude");

  try {
    let query = { _id: { $ne: exclude } };

    if (category && brand) {
      query.$or = [{ category }, { brand }];
    } else if (category) {
      query.category = category;
    } else if (brand) {
      query.brand = brand;
    }

    const relatedProducts = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name")
      .limit(8)
      .lean();

    const productsWithRatings = relatedProducts.map((product) => ({
      ...product,
      averageRating: product.averageRating || 0,
      numReviews: product.numReviews || 0,
    }));

    return NextResponse.json(productsWithRatings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
