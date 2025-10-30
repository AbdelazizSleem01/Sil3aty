import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../models/Product";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

async function getProductsByCategoriesAndBrands(
  categories,
  brands,
  excludeProductIds = [],
  limit = 10
) {
  const query = {
    _id: { $nin: excludeProductIds },
    $or: [{ category: { $in: categories } }, { brand: { $in: brands } }],
  };

  return Product.find(query)
    .populate("category", "name slug")
    .populate("brand", "name logo")
    .limit(limit)
    .lean();
}

async function getFeaturedProducts(limit = 5) {
  return Product.find({ isFeatured: true })
    .populate("category", "name slug")
    .populate("brand", "name logo")
    .limit(limit)
    .lean();
}

async function getUserBasedRecommendations(
  userId,
  excludeProductIds = [],
  limit = 10
) {
  const orders = await Order.find({ user: userId }).populate({
    path: "orderItems",
    populate: {
      path: "product",
      select: "category brand",
    },
  });

  const categories = new Set();
  const brands = new Set();
  const seenProducts = new Set(excludeProductIds);

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.product) {
        const product = item.product;
        categories.add(product.category);
        brands.add(product.brand);
        seenProducts.add(product._id.toString());
      }
    });
  });

  if (categories.size === 0 && brands.size === 0) {
    return getFeaturedProducts(limit);
  }

  const recommendations = await getProductsByCategoriesAndBrands(
    Array.from(categories),
    Array.from(brands),
    Array.from(seenProducts),
    limit
  );

  if (recommendations.length < limit) {
    const featured = await getFeaturedProducts(limit - recommendations.length);
    recommendations.push(...featured);
  }

  return recommendations.slice(0, limit);
}

async function getSimilarProducts(productId, limit = 5) {
  const product = await Product.findById(productId);
  if (!product) return [];

  const recommendations = await Product.find({
    _id: { $ne: productId },
    category: product.category,
  })
    .populate("category", "name slug")
    .populate("brand", "name logo")
    .limit(limit)
    .lean();

  return recommendations;
}

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const limit = parseInt(searchParams.get("limit")) || 10;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    let recommendations = [];

    if (productId) {
      recommendations = await getSimilarProducts(productId, limit);
    } else if (userId) {
      recommendations = await getUserBasedRecommendations(userId, [], limit);
    } else {
      recommendations = await getFeaturedProducts(limit);
    }

    return NextResponse.json(
      {
        success: true,
        recommendations,
        count: recommendations.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching recommendations", error: error.message },
      { status: 500 }
    );
  }
}
