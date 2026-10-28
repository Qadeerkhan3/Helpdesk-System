import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, role, dept } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user (Password hashing model ke pre-save hook se automatically ho jayegi)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      dept: dept || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}