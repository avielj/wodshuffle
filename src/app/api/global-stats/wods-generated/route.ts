import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch the global WODs generated counter
export async function GET() {
  let stats = await prisma.globalStats.findUnique({ where: { id: 1 } });
  if (!stats) {
    stats = await prisma.globalStats.create({ data: { id: 1, wodsGenerated: 0 } });
  }
  return NextResponse.json({ wodsGenerated: stats.wodsGenerated });
}

// POST: Increment the global WODs generated counter
export async function POST(req: NextRequest) {
  const stats = await prisma.globalStats.upsert({
    where: { id: 1 },
    update: { wodsGenerated: { increment: 1 } },
    create: { id: 1, wodsGenerated: 1 },
  });
  return NextResponse.json({ wodsGenerated: stats.wodsGenerated });
}
