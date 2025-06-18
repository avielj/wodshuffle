import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('wod_user_id')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, nickname: true, age: true } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}
