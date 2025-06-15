import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const data = await request.json();
  const { email, password, nickname, age } = data;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
  }
  // Generate password reset token (for future use)
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  // Create user with nickname, age, and passwordResetToken
  const user = await prisma.user.create({ data: { email, password, nickname, age, passwordResetToken } });
  return NextResponse.json({ message: 'Signup successful!', user });
}
