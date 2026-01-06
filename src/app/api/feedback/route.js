import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Feedback from "../../../../models/Feedback";
import { uploadImages } from "../../../../lib/cloudinary";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const role = formData.get("role");
    const email = formData.get("email");
    const comment = formData.get("comment");
    const rating = formData.get("rating");
    const userImage = formData.get("userImage");

    console.log("Received form data:", {
      name,
      role,
      email,
      comment,
      rating,
      hasImage: !!userImage,
      imageSize: userImage?.size,
      imageType: userImage?.type,
    });

    if (!name || !role || !email || !comment || !rating) {
      throw new Error("All fields are required");
    }

    await dbConnect();

    let imageUrl = "/images/default-avatar.png";
    if (userImage && userImage instanceof File && userImage.size > 0) {
      try {
        const maxSize = 5 * 1024 * 1024;
        if (userImage.size > maxSize) {
          throw new Error(
            "Image size too large. Please select an image smaller than 5MB."
          );
        }

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(userImage.type)) {
          throw new Error(
            "Invalid file type. Please select a valid image file (JPEG, PNG, GIF, WebP)."
          );
        }

        // Upload the image to Cloudinary and store the secure URL instead of a base64 string
        const [secureUrl] = await uploadImages(userImage);
        if (secureUrl) {
          imageUrl = secureUrl;
        }
      } catch (imageError) {
        throw new Error(`Image processing failed: ${imageError.message}`);
      }
    }

    const newFeedback = await Feedback.create({
      name,
      role,
      email,
      comment,
      rating: parseInt(rating),
      userImage: imageUrl,
    });

    return NextResponse.json(
      { message: "Feedback Submitted Successfully", feedback: newFeedback },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    // Return feedbacks but avoid sending large base64 payloads.
    // If a stored `userImage` is not a remote URL, replace with default avatar.
    const feedbacks = await Feedback.find({}).lean();
    const updatedFeedbacks = feedbacks.map((feedback) => ({
      ...feedback,
      userImage:
        feedback.userImage && typeof feedback.userImage === "string" && feedback.userImage.startsWith("http")
          ? feedback.userImage
          : "/images/default-avatar.png",
    }));

    return NextResponse.json(updatedFeedbacks);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
