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

    // Check if user already liked the blog
    const isLiked = blog.likes.includes(session.user.id);

    if (isLiked) {
      // Remove like
      await blog.removeLike(session.user.id);
      return NextResponse.json({
        message: "Like removed",
        liked: false,
        likesCount: blog.likes.length - 1
      });
    } else {
      // Add like
      await blog.addLike(session.user.id);
      return NextResponse.json({
        message: "Like added",
        liked: true,
        likesCount: blog.likes.length + 1
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating like", error: error.message },
      { status: 500 }
    );
  }
}
