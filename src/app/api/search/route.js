import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Product from '../../../../models/Product';
import Category from '../../../../models/Category';
import Brand from '../../../../models/Brand';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // Search for matching categories and brands
    const [categories, brands] = await Promise.all([
      Category.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } },
        ],
      }).lean(),
      Brand.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } },
        ],
      }).lean()
    ]);

    let products;

    if (categories.length > 0 || brands.length > 0) {
      const categoryIds = categories.map(c => c._id);
      const brandIds = brands.map(b => b._id);
      
      products = await Product.find({
        $or: [
          { category: { $in: categoryIds } },
          { brand: { $in: brandIds } }
        ]
      })
      .populate('category')
      .populate('brand')
      .lean();
    } else {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .populate('category')
      .populate('brand')
      .lean();
    }

    return NextResponse.json({ 
      success: true,
      results: products 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}