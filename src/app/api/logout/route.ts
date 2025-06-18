import { NextResponse } from 'next/server';

export async function POST() {
  // Expire the HTTP-only cookie
  const response = NextResponse.json({ message: 'Logged out' });
  response.headers.set('Set-Cookie', 'wod_user_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return response;
}
