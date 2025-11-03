import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import dbConnect from "../../../../../lib/dbConnect";
import Blog from "../../../../../models/blog";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const bookmarkedBlogs = await Blog.find({
      bookmarks: session.user.id,
      published: true
    })
      .populate("author", "name profilePicture")
      .sort({ publishedAt: -1 })
      .limit(50); 

    const blogsWithStats = bookmarkedBlogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      publishedAt: blog.publishedAt,
      estimatedReadTime: blog.estimatedReadTime || 5,
      views: blog.views || 0,
      likesCount: blog.likes?.length || 0,
      commentsCount: blog.comments?.length || 0,
      tags: blog.tags || [],
      difficulty: blog.difficulty || "beginner",
    }));

    return NextResponse.json({
      bookmarks: blogsWithStats,
      count: blogsWithStats.length
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
