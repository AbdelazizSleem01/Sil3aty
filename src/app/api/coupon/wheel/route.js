import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Coupon from "../../../../../models/Coupon";

export async function GET() {
  try {
    await dbConnect();

    // Fetch active coupons whose code starts with SPIN
    const coupons = await Coupon.find({
      active: true,
      expiryDate: { $gte: new Date() },
      code: /^SPIN/i,
    }).limit(6);

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await dbConnect();

    // Standard spin wheel coupons expiring in 2030
    const standardCoupons = [
      {
        code: "SPIN10",
        discountType: "percent",
        amount: 10,
        expiryDate: new Date("2030-12-31T23:59:59Z"),
        active: true,
        minOrderValue: 10,
      },
      {
        code: "SPIN15",
        discountType: "percent",
        amount: 15,
        expiryDate: new Date("2030-12-31T23:59:59Z"),
        active: true,
        minOrderValue: 15,
      },
      {
        code: "SPIN20",
        discountType: "percent",
        amount: 20,
        expiryDate: new Date("2030-12-31T23:59:59Z"),
        active: true,
        minOrderValue: 20,
      },
      {
        code: "SPIN25",
        discountType: "percent",
        amount: 25,
        expiryDate: new Date("2030-12-31T23:59:59Z"),
        active: true,
        minOrderValue: 25,
      },
      {
        code: "SPIN_SHIP",
        discountType: "free-shipping",
        amount: 0,
        expiryDate: new Date("2030-12-31T23:59:59Z"),
        active: true,
        minOrderValue: 5,
      },
    ];

    for (const couponData of standardCoupons) {
      const exists = await Coupon.findOne({ code: couponData.code });
      if (!exists) {
        await Coupon.create(couponData);
      }
    }

    return NextResponse.json({ success: true, message: "Coupons seeded successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
