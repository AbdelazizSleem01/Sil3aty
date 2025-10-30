import { getServerSession } from "next-auth";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";
import User from "../../../../../models/User";
import Order from "../../../../../models/Order";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await dbConnect();

    const usersWithOrders = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $match: {
          "orders.0": { $exists: true },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          profilePicture: 1,
          status: 1,
          createdAt: 1,
          orders: {
            _id: 1,
            totalPrice: 1,
            status: 1,
            isPaid: 1,
            createdAt: 1,
            orderItems: 1,
            shippingAddress: 1,
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Process the data to add calculated fields
    const processedUsers = usersWithOrders.map((user) => {
      const orders = user.orders || [];

      // Calculate totals
      const totalSpent = orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      const orderCount = orders.length;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

      // Get last order date
      const lastOrderDate =
        orders.length > 0
          ? Math.max(
              ...orders.map((order) => new Date(order.createdAt).getTime())
            )
          : null;

      // Get most recent order details for quick view
      const sortedOrders = orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        status: user.status,
        createdAt: user.createdAt,
        orders: sortedOrders,
        totalSpent,
        orderCount,
        averageOrderValue,
        lastOrderDate: lastOrderDate
          ? new Date(lastOrderDate).toISOString()
          : null,
      };
    });

    // Sort users by total spent (highest first)
    processedUsers.sort((a, b) => b.totalSpent - a.totalSpent);

    return new Response(
      JSON.stringify({
        success: true,
        users: processedUsers,
        totalUsers: processedUsers.length,
        totalRevenue: processedUsers.reduce(
          (sum, user) => sum + user.totalSpent,
          0
        ),
        totalOrders: processedUsers.reduce(
          (sum, user) => sum + user.orderCount,
          0
        ),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch users with orders",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
