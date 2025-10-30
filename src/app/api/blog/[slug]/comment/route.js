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
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment content is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    await blog.addComment(session.user.id, content.trim());

    await blog.populate('comments.user', 'name profilePicture');

    const newComment = blog.comments[blog.comments.length - 1];

    return NextResponse.json({
      message: "Comment added successfully",
      comment: newComment,
      commentsCount: blog.comments.length
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error adding comment", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { slug } = await params;

    const blog = await Blog.findOne({ slug })
      .populate('comments.user', 'name profilePicture')
      .populate('comments.likes', 'name')
      .populate('comments.replies.user', 'name profilePicture');

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      comments: blog.comments,
      commentsCount: blog.comments.length
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching comments", error: error.message },
      { status: 500 }
    );
  }
}
