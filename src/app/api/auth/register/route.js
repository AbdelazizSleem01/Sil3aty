import { NextResponse } from 'next/server';
import { uploadImages } from '../../../../../lib/cloudinary';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/User';

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const profilePictureFile = formData.get('profilePicture');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    let profilePictureUrl = '';
    if (profilePictureFile) {
      const urls = await uploadImages(profilePictureFile);
      profilePictureUrl = urls[0]; 
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      profilePicture: profilePictureUrl,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}