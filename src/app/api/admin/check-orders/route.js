import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Order from '../../../../../models/Order';

export async function GET() {
  try {
    await dbConnect();

    const orders = await Order.find({}).select('status totalPrice').limit(10);
    
    const statusCount = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      if (order.totalPrice) {
        totalRevenue += order.totalPrice;
      }
    });

    return NextResponse.json({
      ordersSample: orders,
      statusCount: statusCount,
      totalRevenue: totalRevenue,
      totalOrders: orders.length
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check orders' }, { status: 500 });
  }
}