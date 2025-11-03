import dbConnect from "../../lib/dbConnect";
import Product from "../../models/Product";

export default async function sitemap() {
  const baseUrl = "https://sil3aty.vercel.app";

  const staticPages = [
    "",
    "/product",
    "/category",
    "/brands",
    "/about",
    "/contact",
    "/help",
    "/terms",
    "/privacy",
    "/login",
    "/register",
  ];

  const staticUrls = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "daily" : "weekly",
    priority: page === "" ? 1.0 : 0.8,
  }));

  try {
    await dbConnect();
    const products = await Product.find({}, "_id updatedAt");

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticUrls, ...productUrls];
  } catch (error) {
    return staticUrls;
  }
}
