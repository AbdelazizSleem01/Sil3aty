import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Coupon from '../../../../../../models/Coupon';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/authOptions';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذه الصفحة' }, { status: 403 });
    }

    const { id } = await params;

    const coupon = await Coupon.findById(id)
      .populate('applicableUsers', 'name email');

    if (!coupon) {
      return NextResponse.json({ error: 'الكوبون غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      coupon: {
        ...coupon.toObject(),
        canBeUsed: coupon.active &&
          new Date(coupon.expiryDate) >= new Date() &&
          (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit)
      }
    });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الكوبون' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذه الصفحة' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.discountType && !['percent', 'fixed', 'free-shipping'].includes(body.discountType)) {
      return NextResponse.json(
        { error: 'نوع الخصم غير صحيح' },
        { status: 400 }
      );
    }

    if (body.expiryDate && new Date(body.expiryDate) <= new Date()) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون في المستقبل' },
        { status: 400 }
      );
    }

    if (body.code) {
      const existingCoupon = await Coupon.findOne({
        code: body.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return NextResponse.json(
          { error: 'كود الكوبون موجود مسبقاً' },
          { status: 400 }
        );
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...body,
        ...(body.code && { code: body.code.toUpperCase() })
      },
      {
        new: true,
        runValidators: true
      }
    )
    .populate('applicableUsers', 'name email');

    if (!coupon) {
      return NextResponse.json({ error: 'الكوبون غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      coupon,
      message: 'تم تحديث الكوبون بنجاح'
    });

  } catch (error) {
    console.error('Error updating coupon:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'كود الكوبون موجود مسبقاً' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الكوبون' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذه الصفحة' }, { status: 403 });
    }

    const { id } = await params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ error: 'الكوبون غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'تم حذف الكوبون بنجاح'
    });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الكوبون' },
      { status: 500 }
    );
  }
}
