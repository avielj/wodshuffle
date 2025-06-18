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
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.name || !data.format) {
      return NextResponse.json({ error: 'Missing required fields: name, format' }, { status: 400 });
    }
    const wod = await prisma.wod.create({ data });
    return NextResponse.json(wod);
  } catch (err) {
    console.error('Error creating WOD:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
