import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import Blog from "../../../../../../models/blog";


export async function GET(request, context) {
  const params = await context.params;
  await dbConnect();

  try {
    const authorId = params.id;

    const articleCount = await Blog.countDocuments({
      author: authorId,
      published: true
    });

    return NextResponse.json({ articlesCount: articleCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
