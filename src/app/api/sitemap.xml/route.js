import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../models/Product";

export async function GET() {
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

  let urls = staticPages.map(
    (page) => `
      <url>
        <loc>${baseUrl}${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>
        <priority>${page === "" ? "1.0" : "0.8"}</priority>
      </url>`
  );

  try {
    await dbConnect();
    const products = await Product.find({}, "_id updatedAt");
    const productUrls = products.map(
      (p) => `
        <url>
          <loc>${baseUrl}/product/${p._id}</loc>
          <lastmod>${
            p.updatedAt?.toISOString() || new Date().toISOString()
          }</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
        </url>`
    );
    urls = urls.concat(productUrls);
  } catch (e) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
