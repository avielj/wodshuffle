import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get all favorites for a user (expects ?userId=...)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { wod: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favorites);
}

// POST: Add a favorite (expects { userId, wodId })
export async function POST(req: NextRequest) {
  const { userId, wodId } = await req.json();
  if (!userId || !wodId) return NextResponse.json({ error: "Missing userId or wodId" }, { status: 400 });
  const favorite = await prisma.favorite.create({
    data: { userId, wodId },
    include: { wod: true },
  });
  return NextResponse.json(favorite);
}

// DELETE: Remove a favorite (expects { userId, wodId })
export async function DELETE(req: NextRequest) {
  const { userId, wodId } = await req.json();
  if (!userId || !wodId) return NextResponse.json({ error: "Missing userId or wodId" }, { status: 400 });
  await prisma.favorite.deleteMany({ where: { userId, wodId } });
  return NextResponse.json({ success: true });
}
