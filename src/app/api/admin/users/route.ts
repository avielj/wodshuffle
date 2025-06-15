import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all users
export async function GET() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, createdAt: true } });
  return NextResponse.json(users);
}
