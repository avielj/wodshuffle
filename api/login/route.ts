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

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // In production, generate a JWT or session token here
    return NextResponse.json({ message: 'Login successful', user: { email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
