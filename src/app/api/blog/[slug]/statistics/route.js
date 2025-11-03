import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import Blog from "../../../../../../models/blog";


export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { slug } = await params;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const currentStats = await Blog.getCurrentMonthStats(blog._id);

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStats = await Blog.findOne({
      blog: blog._id,
      year: lastMonth.getFullYear(),
      month: lastMonth.getMonth() + 1
    }) || {
      views: 0,
      uniqueViews: 0,
      likes: 0,
      comments: 0,
      bookmarks: 0,
      newLikes: 0,
      newComments: 0,
      newBookmarks: 0
    };

    const calculatePercentage = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const statistics = {
      totalViews: blog.views,
      totalUniqueViews: blog.uniqueViews,
      totalLikes: blog.likesCount,
      totalComments: blog.commentsCount,
      totalBookmarks: blog.bookmarksCount,

      currentMonthViews: currentStats.views,
      currentMonthLikes: currentStats.newLikes,
      currentMonthComments: currentStats.newComments,
      currentMonthBookmarks: currentStats.newBookmarks,

      monthlyViews: currentStats.views,

      viewsChangePercent: calculatePercentage(currentStats.views, lastMonthStats.views),
      likesChangePercent: calculatePercentage(currentStats.newLikes, lastMonthStats.newLikes),
      commentsChangePercent: calculatePercentage(currentStats.newComments, lastMonthStats.newComments),
      bookmarksChangePercent: calculatePercentage(currentStats.newBookmarks, lastMonthStats.newBookmarks),
      monthlyViewsChangePercent: calculatePercentage(currentStats.views, lastMonthStats.views),

      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(statistics, { status: 200 });

  } catch (error) {
    console.error("Error fetching blog statistics:", error);
    return NextResponse.json(
      { message: "Error fetching statistics", error: error.message },
      { status: 500 }
    );
  }
}
