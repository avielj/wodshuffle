import { NextRequest, NextResponse } from 'next/server';

// Mock user database (replace with real database in production)
const users = [
  { email: 'test@example.com', password: 'password123' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // In production, hash the password with bcrypt before storing
    users.push({ email, password });
    return NextResponse.json({ message: 'Sign up successful' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
