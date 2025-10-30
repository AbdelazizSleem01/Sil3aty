import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Notification from '../../../../../../models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/authOptions';

export async function POST(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await Notification.updateMany(
      { recipients: session.user.id, read: false },
      { $set: { read: true } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
} 