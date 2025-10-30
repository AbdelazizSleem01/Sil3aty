import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import ourTeam from '../../../../../models/OutTeam';
import { authOptions } from '../../../../../lib/authOptions';
import { getServerSession } from 'next-auth';

export async function POST(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();

    const name = data.get('name');
    const role = data.get('role');
    const comment = data.get('comment');
    const facebook = data.get('facebook');
    const twitter = data.get('twitter');
    const imageFile = data.get('image');

    const { uploadImages } = require('../../../../../lib/cloudinary.js');
    const imageUrls = await uploadImages(imageFile);
    const image = imageUrls[0];

    const newTeamMember = new ourTeam({
      name,
      role,
      comment,
      facebook,
      twitter,
      image
    });

    await newTeamMember.save();

    return NextResponse.json({ message: 'Team member created successfully', data: newTeamMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create team member', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const teamMembers = await ourTeam.find().sort({ createdAt: -1 });
    return NextResponse.json(teamMembers);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch team members', error: error.message }, { status: 500 });
  }
}