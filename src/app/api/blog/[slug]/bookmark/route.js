import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../../lib/dbConnect";
import Blog from "../../../../../../models/blog";
import { authOptions } from "../../../../../../lib/authOptions";

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    // Check if user already bookmarked the blog
    const isBookmarked = blog.bookmarks.includes(session.user.id);

    if (isBookmarked) {
      // Remove bookmark
      await blog.removeBookmark(session.user.id);
      return NextResponse.json({
        message: "Bookmark removed",
        bookmarked: false,
        bookmarksCount: blog.bookmarks.length - 1
      });
    } else {
      // Add bookmark
      await blog.addBookmark(session.user.id);
      return NextResponse.json({
        message: "Bookmark added",
        bookmarked: true,
        bookmarksCount: blog.bookmarks.length + 1
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating bookmark", error: error.message },
      { status: 500 }
    );
  }
}
