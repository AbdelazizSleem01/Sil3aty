import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/User';
import Order from '../../../../../models/Order';
import Product from '../../../../../models/Product';
import Subscription from '../../../../../models/Subscription';
import Contact from '../../../../../models/Contact';

export async function GET() {
  try {
    await dbConnect();

    const [
      usersCount,
      allOrders,
      productsCount,
      subscriptionsCount,
      messagesCount
    ] = await Promise.all([
      User.countDocuments(),
      Order.find({}).select('totalPrice status'),
      Product.countDocuments(),
      Subscription.countDocuments(),
      Contact.countDocuments()
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    const completedOrders = allOrders.filter(order => 
      order.status === 'completed' || 
      order.status === 'delivered' || 
      order.status === 'shipped'
    );

    const completedOrdersRevenue = completedOrders.reduce((sum, order) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    return NextResponse.json({
      users: usersCount,
      orders: allOrders.length,
      products: productsCount,
      revenue: totalRevenue, 
      completedRevenue: completedOrdersRevenue, 
      subscriptions: subscriptionsCount,
      messages: messagesCount,
      completedOrders: completedOrders.length,
      averageOrderValue: averageOrderValue
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}