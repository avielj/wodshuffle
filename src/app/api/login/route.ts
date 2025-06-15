import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  // Here you would add your login logic, e.g. check credentials, etc.
  // For now, just echo the data back for testing.
  return NextResponse.json({ message: 'Login successful!', data });
}
