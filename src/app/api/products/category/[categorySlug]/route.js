import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Category from '../../../../../../models/Category';
import Product from '../../../../../../models/Product';

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const resolvedParams = await params;
    const { categorySlug } = resolvedParams;

    if (!categorySlug) {
      return NextResponse.json(
        { message: 'Category slug is required' },
        { status: 400 }
      );
    }

    const category = await Category.findOne({ slug: categorySlug });
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    const products = await Product.find({ category: category._id })
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .lean();

    return NextResponse.json(products);
    
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
