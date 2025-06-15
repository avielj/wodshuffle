import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all strength exercises (type: 'strength')
export async function GET() {
  const exercises = await prisma.exercise.findMany({ where: { type: 'strength' } });
  return NextResponse.json(exercises);
}

// POST: Create a new strength exercise
export async function POST(req: NextRequest) {
  const data = await req.json();
  const exercise = await prisma.exercise.create({ data: { ...data, type: 'strength' } });
  return NextResponse.json(exercise);
}
