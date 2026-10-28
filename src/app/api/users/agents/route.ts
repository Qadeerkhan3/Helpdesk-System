import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET() {
  try {
    await dbConnect();
    // Sirf agents ya admins ko fetch karein jo tickets handle kar sakein
    const agents = await User.find({ role: { $in: ['agent', 'admin'] } }).select('name email role');

    return NextResponse.json(
      { success: true, data: agents },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch Agents Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}