import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get all workout history for a user (expects ?userId=...)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const history = await prisma.history.findMany({
    where: { userId },
    include: { wod: true },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(history);
}

// POST: Add a history entry (expects { userId, wodId })
export async function POST(req: NextRequest) {
  try {
    const { userId, wodId } = await req.json();
    if (!userId || !wodId) {
      console.error('Missing userId or wodId', { userId, wodId });
      return NextResponse.json({ error: "Missing userId or wodId" }, { status: 400 });
    }
    const entry = await prisma.history.create({
      data: { userId, wodId },
      include: { wod: true },
    });
    return NextResponse.json(entry);
  } catch (err) {
    console.error('Error in history POST:', err);
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}

// DELETE: Remove a history entry (expects { userId, wodId })
export async function DELETE(req: NextRequest) {
  const { userId, wodId } = await req.json();
  if (!userId || !wodId) return NextResponse.json({ error: "Missing userId or wodId" }, { status: 400 });
  await prisma.history.deleteMany({ where: { userId, wodId } });
  return NextResponse.json({ success: true });
}
