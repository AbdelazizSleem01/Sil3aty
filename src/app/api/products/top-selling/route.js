import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Order from '../../../../../models/Order';
import Product from '../../../../../models/Product';
import Category from '../../../../../models/Category';
import Brand from '../../../../../models/Brand';
import Review from '../../../../../models/Review';

export async function GET(request) {
  try {
    await dbConnect();

    let topSellingProducts = [];

    try {
      const topSelling = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$orderItems' },
        { $match: { 'orderItems.qty': { $gt: 0 } } },
        {
          $group: {
            _id: '$orderItems.product',
            totalSold: { $sum: '$orderItems.qty' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 6 }
      ]);

      if (topSelling.length > 0) {
        const productIds = topSelling.map(item => item._id);
        topSellingProducts = await Product.find({
          _id: { $in: productIds }
        })
        .populate('category', 'name')
        .populate('brand', 'name');

        topSellingProducts = await Promise.all(
          topSellingProducts.map(async (product) => {
            const reviews = await Review.find({ product: product._id });
            const numReviews = reviews.length;
            const averageRating = numReviews > 0 
              ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews
              : 0;

            return {
              ...product.toObject(),
              numReviews,
              averageRating
            };
          })
        );
      }
    } catch (aggregationError) {
      const orders = await Order.find({ 
        status: { $ne: 'cancelled' },
        items: { $exists: true, $ne: [] }
      }).select('items');

      const productSales = {};

      orders.forEach(order => {
        order.items.forEach(item => {
          if (item?.product && item.quantity > 0) {
            const productId = item.product.toString();
            productSales[productId] = (productSales[productId] || 0) + item.quantity;
          }
        });
      });

      const sortedProductIds = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(entry => entry[0]);

      if (sortedProductIds.length > 0) {
        topSellingProducts = await Product.find({
          _id: { $in: sortedProductIds }
        })
        .populate('category', 'name')
        .populate('brand', 'name');

        topSellingProducts = await Promise.all(
          topSellingProducts.map(async (product) => {
            const reviews = await Review.find({ product: product._id });
            const numReviews = reviews.length;
            const averageRating = numReviews > 0 
              ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews
              : 0;

            return {
              ...product.toObject(),
              numReviews,
              averageRating
            };
          })
        );
      }
    }

    if (topSellingProducts.length === 0) {
      topSellingProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('category', 'name')
        .populate('brand', 'name');

      topSellingProducts = await Promise.all(
        topSellingProducts.map(async (product) => {
          const reviews = await Review.find({ product: product._id });
          const numReviews = reviews.length;
          const averageRating = numReviews > 0 
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews
            : 0;

          return {
            ...product.toObject(),
            numReviews,
            averageRating
          };
        })
      );
    }

    return NextResponse.json(topSellingProducts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch top selling products' },
      { status: 500 }
    );
  }
}
