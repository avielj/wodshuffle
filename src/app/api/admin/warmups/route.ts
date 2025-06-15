import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all warmups (Exercise with type 'warmup')
export async function GET() {
  const warmups = await prisma.exercise.findMany({ where: { type: 'warmup' } });
  return NextResponse.json(warmups);
}

// POST: Create a new warmup
export async function POST(req: NextRequest) {
  const data = await req.json();
  const warmup = await prisma.exercise.create({ data: { ...data, type: 'warmup' } });
  return NextResponse.json(warmup);
}
