import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all workouts
export async function GET() {
  const wods = await prisma.wod.findMany();
  return NextResponse.json(wods);
}

// POST: Create a new workout
export async function POST(req: NextRequest) {
  const data = await req.json();
  const wod = await prisma.wod.create({ data });
  return NextResponse.json(wod);
}
