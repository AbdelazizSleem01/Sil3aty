import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Subscription from "../../../../models/Subscription";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});
export async function POST(request) {
  await dbConnect();

  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const existingSubscriber = await Subscription.findOne({ email });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      );
    }

    const verifyToken = crypto.randomBytes(20).toString("hex");

    const newSubscriber = new Subscription({ email, verifyToken });
    await newSubscriber.save();

    const verificationLink = `${process.env.NEXT_PUBLIC_API_URL}/verify?token=${verifyToken}`;
    const mailOptions = {
      from: "Sil3aty App",
      to: email,
      subject: "Verify Your Email For Sil3aty",
      text: `Click the link to verify your email: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img loading="lazy" src="https://ecommerce-Sil3aty.vercel.app/images/logo copy.png" alt="Your Website Logo" style="max-width: 150px; height: auto;" />
          </div>
          <h2 style="color: #4A90E2; text-align: center;">Verify Your Email Address</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for subscribing to our newsletter! To complete your subscription, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4A90E2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
            If you did not sign up for this account, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
            <p>© 2025 Your Website. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message:
          "Thank you for subscribing! Please check your email to verify the message of verify may received it in spam messages.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
