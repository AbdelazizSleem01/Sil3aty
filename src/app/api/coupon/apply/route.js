import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import dbConnect from '../../../../../lib/dbConnect';
import Coupon from '../../../../../models/Coupon';
import Cart from '../../../../../models/Cart'; 

export async function POST(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { code, orderTotal, shippingCost = 0, productIds = [] } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'كود الكوبون مطلوب' }, { status: 400 });
    }

    if (!orderTotal || typeof orderTotal !== 'number' || orderTotal <= 0) {
      return NextResponse.json({ error: 'إجمالي الطلب غير صحيح' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!coupon) {
      return NextResponse.json({ error: 'كود الكوبون غير صحيح' }, { status: 400 });
    }

    if (new Date(coupon.expiryDate) <= new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية الكوبون' }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'تم تجاوز حد استخدام الكوبون' }, { status: 400 });
    }

    if (orderTotal < coupon.minOrderValue) {
      return NextResponse.json({
        error: `الحد الأدنى للطلب هو ${coupon.minOrderValue} دولار`
      }, { status: 400 });
    }

    if (coupon.applicableUsers?.length > 0 && !coupon.applicableUsers.includes(session.user.id)) {
      return NextResponse.json({ error: 'هذا الكوبون غير متاح لك' }, { status: 400 });
    }

    if (coupon.applicableProducts?.length > 0) {
      const valid = productIds.some(id => coupon.applicableProducts.includes(id));
      if (!valid) {
        return NextResponse.json({
          error: 'هذا الكوبون لا ينطبق على المنتجات المحددة'
        }, { status: 400 });
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (orderTotal * coupon.amount) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.amount;
    } else if (coupon.discountType === 'shipping') {
      discountAmount = shippingCost;
    }

    const discountedTotal = orderTotal - discountAmount;

    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { coupon: coupon._id },
      { new: true }
    ).populate('coupon');

    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } }).exec();

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        amount: coupon.amount,
        discountAmount,
        discountedTotal,
        freeShipping: coupon.discountType === 'shipping',
        message:
          coupon.discountType === 'shipping'
            ? 'تم تطبيق شحن مجاني!'
            : `تم تطبيق خصم ${coupon.discountType === 'percent' ? coupon.amount + '%' : '$' + coupon.amount}!`
      }
    });

  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تطبيق الكوبون' },
      { status: 500 }
    );
  }
}
