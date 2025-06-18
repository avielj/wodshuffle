import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const data = await request.json();
  const { email, password } = data;
  // Find user in DB
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  // Set HTTP-only cookie with userId
  const response = NextResponse.json({ message: 'Login successful!', user: { id: user.id, email: user.email } });
  response.headers.set('Set-Cookie', `wod_user_id=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`); // 7 days
  return response;
}
