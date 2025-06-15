import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// POST: Request password reset (send token)
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({ where: { email }, data: { passwordResetToken: token } });
  // In production, send token via email. Here, just return it for testing.
  return NextResponse.json({ message: 'Password reset token generated.', token });
}

// PUT: Reset password using token or as admin
export async function PUT(request: Request) {
  const { token, newPassword, email, admin } = await request.json();
  if (admin && email && newPassword) {
    // Admin can reset password directly by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    await prisma.user.update({ where: { email }, data: { password: newPassword, passwordResetToken: null } });
    return NextResponse.json({ message: 'Password reset by admin.' });
  }
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
  }
  const user = await prisma.user.findFirst({ where: { passwordResetToken: token } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
  }
  await prisma.user.update({ where: { id: user.id }, data: { password: newPassword, passwordResetToken: null } });
  return NextResponse.json({ message: 'Password reset successful.' });
}
