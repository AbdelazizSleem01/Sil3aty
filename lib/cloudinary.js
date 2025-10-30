import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImages = async (files) => {
  try {
    if (!Array.isArray(files)) {
      files = [files];
    }

    files = files.filter((f) => f && f !== "undefined" && f !== "");

    const uploadPromises = files.map(async (file) => {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const result = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64}`,
          { folder: "products" }
        );
        return result.secure_url;
      } else if (file.buffer) {
        const base64 = file.buffer.toString("base64");
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { folder: "products" }
        );
        return result.secure_url;
      } else if (file.arrayBuffer) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const result = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64}`,
          { folder: "products" }
        );
        return result.secure_url;
      } else if (typeof file === "string" && file.startsWith("http")) {
        return file;
      } else {
        return null; // ✅ بدل ما نرمي error، نرجع null
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url) => url !== null); // ✅ نحذف أي null
  } catch (error) {
    throw error;
  }
};
