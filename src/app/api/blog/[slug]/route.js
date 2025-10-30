import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../lib/dbConnect";
import Blog from "../../../../../models/blog";
import User from "../../../../../models/User";
import Category from "../../../../../models/Category";
import Brand from "../../../../../models/Brand";
import { authOptions } from "../../../../../lib/authOptions";
import { uploadImages } from "../../../../../lib/cloudinary";

export async function GET(request, context) {
  const params = await context.params;
  await dbConnect();
  try {
    const blog = await Blog.findOne({ slug: params.slug })
      .populate("author", "name profilePicture")
      .populate("authorDetails" , "name profilePicture")
      .populate("categories");
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const resolvedParams = await params;

    const blog = await Blog.findOne({ slug: resolvedParams.slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    if (blog.author.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") || blog.title;
    const content = formData.get("content") || blog.content;
    const excerpt = formData.get("excerpt") || blog.excerpt;
    const coverImage = formData.get("coverImage");
    const tags = formData.get("tags")?.split(",") || blog.tags;
    const categories =
      formData.get("categories")?.split(",") || blog.categories;
    const featured = formData.get("featured") === "true" || blog.featured;
    const published = formData.get("published") === "true" || blog.published;

    let slug = formData.get("slug");
    if (!slug || slug.trim() === "") {
      if (title !== blog.title) {
        slug = title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
          .substring(0, 60);
      } else {
        slug = blog.slug;
      }
    } else {
      slug = slug
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
    }

    let coverImageUrl = blog.coverImage;
    if (coverImage) {
      [coverImageUrl] = await uploadImages([coverImage], "blog-images");
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blog._id,
      {
        title,
        slug,
        content,
        excerpt,
        coverImage: coverImageUrl,
        authorAvatar: formData.get("authorAvatar") || blog.authorAvatar,
        tags,
        categories,
        featured,
        published,
        publishedAt: published ? blog.publishedAt || new Date() : null,
        metaTitle: title.substring(0, 60),
        metaDescription: excerpt.substring(0, 160),
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating blog", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const resolvedParams = await params;

    const blog = await Blog.findOne({ slug: resolvedParams.slug });
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    if (blog.author.toString() !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await Blog.findByIdAndDelete(blog._id);

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting blog", error: error.message },
      { status: 500 }
    );
  }
}
