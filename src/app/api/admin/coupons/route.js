import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Coupon from '../../../../../models/Coupon';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';

export async function GET(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذه الصفحة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }
    if (active !== null && active !== undefined) {
      query.active = active === 'true';
    }

    const coupons = await Coupon.find(query)
      .populate('applicableUsers', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Coupon.countDocuments(query);

    const transformedCoupons = coupons.map(coupon => ({
      ...coupon,
      canBeUsed: coupon.active &&
        new Date(coupon.expiryDate) >= new Date() &&
        (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit)
    }));

    return NextResponse.json({
      coupons: transformedCoupons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: total > page * limit
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الكوبونات' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذه الصفحة' }, { status: 403 });
    }

    const body = await request.json();

    const requiredFields = ['code', 'discountType', 'amount', 'expiryDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `الحقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    if (!['percent', 'fixed', 'free-shipping'].includes(body.discountType)) {
      return NextResponse.json(
        { error: 'نوع الخصم غير صحيح' },
        { status: 400 }
      );
    }

    if (new Date(body.expiryDate) <= new Date()) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون في المستقبل' },
        { status: 400 }
      );
    }

    const existingCoupon = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'كود الكوبون موجود مسبقاً' },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      ...body,
      code: body.code.toUpperCase(),
      active: body.active !== undefined ? body.active : true,
      applicableUsers: body.applicableUsers || [],
      applicableProducts: body.applicableProducts || []
    });

    await coupon.save();

    await coupon.populate('applicableUsers', 'name email');

    return NextResponse.json({
      coupon,
      message: 'تم إنشاء الكوبون بنجاح'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'كود الكوبون موجود مسبقاً' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الكوبون' },
      { status: 500 }
    );
  }
}
