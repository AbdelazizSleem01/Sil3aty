import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/User';
import Order from '../../../../../models/Order';
import Product from '../../../../../models/Product';
import Category from '../../../../../models/Category';
import Brand from '../../../../../models/Brand';
import Contact from '../../../../../models/Contact';
import Feedback from '../../../../../models/Feedback';
import Subscription from '../../../../../models/Subscription';
import Review from '../../../../../models/Review';
import Coupon from '../../../../../models/Coupon';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      usersCount,
      adminsCount,
      regularUsersCount,
      productsCount,
      categoriesCount,
      brandsCount,
      allOrders,
      contactsCount,
      feedbacksCount,
      subscriptionsCount,
      reviewsCount,
      prevUsersCount,
      prevProductsCount,
      prevContactsCount,

      // Revenue data
      dailyOrders,
      monthlyOrders,
      yearlyOrders,
      lastMonthOrders,

      // User insights
      userOrderStats,
      topActiveUsers,

      // Reviews data
      reviewStats,
      productRatings,

      // Coupon data
      couponsData,
      couponUsageStats,

      // Most selling products
      productSalesData
    ] = await Promise.all([
      // General Statistics
      User.countDocuments(),
      User.countDocuments({ isAdmin: true }),
      User.countDocuments({ isAdmin: false }),
      Product.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Order.find({}).select('status totalPrice createdAt user orderItems'),
      Contact.countDocuments(),
      Feedback.countDocuments(),
      Subscription.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ createdAt: { $lt: startOfMonth } }),
      Product.countDocuments({ createdAt: { $lt: startOfMonth } }),
      Contact.countDocuments({ createdAt: { $lt: startOfMonth } }),

      // Revenue data
      Order.find({ createdAt: { $gte: startOfDay } }).select('totalPrice'),
      Order.find({ createdAt: { $gte: startOfMonth } }).select('totalPrice'),
      Order.find({ createdAt: { $gte: startOfYear } }).select('totalPrice'),
      Order.find({ createdAt: { $gte: lastMonth, $lte: endOfLastMonth } }).select('totalPrice'),

      // User insights
      Order.aggregate([
        { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
        { $sort: { orderCount: -1 } }
      ]),
      Order.aggregate([
        { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $sort: { orderCount: -1 } },
        { $limit: 10 }
      ]),

      // Reviews data
      Review.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]),
      Review.aggregate([
        {
          $group: {
            _id: '$product',
            avgRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        },
        { $sort: { reviewCount: -1 } },
        { $limit: 10 }
      ]),

      // Coupon data
      Coupon.find({}).select('code active expiryDate usedCount'),
      Order.aggregate([
        { $match: { coupon: { $ne: null } } },
        { $group: { _id: '$coupon', usageCount: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
      ]),

      // Most selling products
      Order.aggregate([
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            totalSold: { $sum: '$orderItems.qty' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ])
    ]);

    // Process order statuses
    const orderStatuses = {
      successful: allOrders.filter(order => ['delivered', 'completed'].includes(order.status)).length,
      delivered: allOrders.filter(order => order.status === 'delivered').length,
      canceled: allOrders.filter(order => order.status === 'cancelled').length,
      processing: allOrders.filter(order => order.status === 'processing').length,
      shipped: allOrders.filter(order => order.status === 'shipped').length
    };

    // Calculate revenues
    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Calculate growths
    const lastMonthOrdersCount = lastMonthOrders.length;
    const currentMonthOrdersCount = monthlyOrders.length;

    const usersGrowth = prevUsersCount > 0 ? ((usersCount - prevUsersCount) / prevUsersCount) * 100 : (usersCount > 0 ? 100 : 0);
    const productsGrowth = prevProductsCount > 0 ? ((productsCount - prevProductsCount) / prevProductsCount) * 100 : (productsCount > 0 ? 100 : 0);
    const contactsGrowth = prevContactsCount > 0 ? ((contactsCount - prevContactsCount) / prevContactsCount) * 100 : (contactsCount > 0 ? 100 : 0);
    const ordersGrowth = lastMonthOrdersCount > 0 ? ((currentMonthOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100 : (currentMonthOrdersCount > 0 ? 100 : 0);

    // User insights calculations
    const totalOrdersCount = allOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? allOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / totalOrdersCount : 0;

    // Coupon statistics
    const activeCoupons = couponsData.filter(coupon => coupon.active && new Date(coupon.expiryDate) > now).length;
    const expiredCoupons = couponsData.filter(coupon => new Date(coupon.expiryDate) <= now).length;
    const totalCouponUsage = couponUsageStats.reduce((sum, stat) => sum + stat.usageCount, 0);
    const totalCouponRevenue = couponUsageStats.reduce((sum, stat) => sum + stat.revenue, 0);

    // Prepare chart data
    const revenueChartData = [
      { name: 'Daily', revenue: dailyRevenue },
      { name: 'Monthly', revenue: monthlyRevenue },
      { name: 'Yearly', revenue: yearlyRevenue }
    ];

    const orderStatusChartData = [
      { name: 'Successful', value: orderStatuses.successful, color: '#10B981' },
      { name: 'Delivered', value: orderStatuses.delivered, color: '#3B82F6' },
      { name: 'Processing', value: orderStatuses.processing, color: '#F59E0B' },
      { name: 'Shipped', value: orderStatuses.shipped, color: '#8B5CF6' },
      { name: 'Canceled', value: orderStatuses.canceled, color: '#EF4444' }
    ];

    const ratingDistributionData = reviewStats.map(stat => ({
      rating: stat._id,
      count: stat.count
    }));

    const topProductsData = productSalesData.map(item => ({
      name: item.product.name,
      sold: item.totalSold,
      revenue: item.revenue
    }));

    return NextResponse.json({
      // General Statistics
      generalStats: {
        totalUsers: usersCount,
        totalAdmins: adminsCount,
        totalRegularUsers: regularUsersCount,
        totalProducts: productsCount,
        totalCategories: categoriesCount,
        totalBrands: brandsCount,
        totalOrders: totalOrdersCount,
        orderStatuses,
        totalContacts: contactsCount,
        totalFeedbacks: feedbacksCount,
        totalSubscribers: subscriptionsCount,
        totalReviews: reviewsCount,
        usersGrowth,
        productsGrowth,
        ordersGrowth,
        contactsGrowth
      },

      // Sales & Revenue
      salesRevenue: {
        dailyRevenue,
        monthlyRevenue,
        yearlyRevenue,
        revenueGrowth,
        revenueChartData,
        orderStatusChartData
      },

      // User Insights
      userInsights: {
        ordersPerUser: userOrderStats,
        averageOrderValue,
        topActiveUsers: topActiveUsers.slice(0, 5)
      },

      // Reviews & Feedback
      reviewsFeedback: {
        ratingDistribution: ratingDistributionData,
        topRatedProducts: productRatings,
        averageRating: reviewStats.length > 0 ?
          reviewStats.reduce((sum, stat) => sum + (stat._id * stat.count), 0) /
          reviewStats.reduce((sum, stat) => sum + stat.count, 0) : 0
      },

      // Coupons
      coupons: {
        totalCoupons: couponsData.length,
        activeCoupons,
        expiredCoupons,
        totalUsage: totalCouponUsage,
        totalRevenue: totalCouponRevenue,
        usageStats: couponUsageStats
      },

      // Top Selling Products
      topProducts: topProductsData
    }, { status: 200 });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch comprehensive dashboard stats' }, { status: 500 });
  }
}
