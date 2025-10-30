import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../lib/dbConnect";
import Blog from "../../../../models/blog";
import User from "../../../../models/User";
import { uploadImages } from "../../../../lib/cloudinary";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
  try {
    await dbConnect();

    const blogs = await Blog.find({ published: true })
      .populate("author", "name profilePicture bio authorLinks")
      .populate("categories", "name slug")
      .sort({ publishedAt: -1 })
      .limit(20);

    const blogsWithStats = blogs.map((blog) => {
      const blogObj = blog.toObject();
      return {
        ...blogObj,
        likesCount: blog.likes?.length || 0,
        bookmarksCount: blog.bookmarks?.length || 0,
        commentsCount: blog.comments?.length || 0,
        averageRating:
          blog.ratingCount && blog.ratingCount > 0
            ? (blog.rating / blog.ratingCount).toFixed(1)
            : 0,
        estimatedReadTime: blog.estimatedReadTime || 5,
      };
    });

    return NextResponse.json(blogsWithStats);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching blogs", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const excerpt = formData.get("excerpt");
    const coverImage = formData.get("coverImage");
    const tags =
      formData
        .get("tags")
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) || [];
    const topics =
      formData
        .get("topics")
        ?.split(",")
        .map((topic) => topic.trim())
        .filter(Boolean) || [];
    const difficulty = formData.get("difficulty") || "beginner";
    const featured = formData.get("featured") === "true";
    const published = formData.get("published") === "true";
    const authorBio = formData.get("authorBio") || "";

    if (!title || !content || !coverImage) {
      return NextResponse.json(
        { message: "Title, content and cover image are required" },
        { status: 400 }
      );
    }

    const [coverImageUrl] = await uploadImages([coverImage], "blog-images");

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);

    const newBlog = new Blog({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImageUrl,
      author: session.user.id,
      authorAvatar: session.user.profilePicture || "/images/default-avatar.png",
      tags,
      difficulty,
      featured,
      published,
      publishedAt: published ? new Date() : null,
      metaTitle: title.substring(0, 60),
      metaDescription: excerpt.substring(0, 160),
    });

    if (authorBio) newBlog.authorBio = authorBio;
    if (topics.length > 0) {
      newBlog.topics = topics.map((topic) => ({
        name: topic,
        slug: topic.toLowerCase().replace(/\s+/g, "-"),
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      }));
    }

    await newBlog.save();

    return NextResponse.json(
      { message: "Blog created successfully", blog: newBlog },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating blog", error: error.message },
      { status: 500 }
    );
  }
}
