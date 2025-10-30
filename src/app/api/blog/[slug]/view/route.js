import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../../lib/dbConnect";
import Blog from "../../../../../../models/blog";
import { authOptions } from "../../../../../../lib/authOptions";

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  try {
    const { slug } = await params;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const userId = session?.user?.id || null;
    await blog.addView(userId);

    return NextResponse.json({
      message: "View recorded",
      views: blog.views,
      uniqueViews: blog.uniqueViews
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error recording view", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { slug } = await params;

    const blog = await Blog.findOne({ slug })
      .populate('author', 'name profilePicture bio authorLinks')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name')
      .populate('bookmarks', 'name');

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    // Calculate read time if not set
    if (!blog.estimatedReadTime || blog.estimatedReadTime === 1) {
      blog.estimatedReadTime = blog.calculateReadTime();
      await blog.save();
    }

    const blogObj = blog.toObject();

    return NextResponse.json({
      blog: {
        ...blogObj,
        likesCount: blog.likesCount,
        bookmarksCount: blog.bookmarksCount,
        commentsCount: blog.commentsCount,
        averageRating: blog.averageRating,
        estimatedReadTime: blog.estimatedReadTime
      }
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching blog", error: error.message },
      { status: 500 }
    );
  }
}
