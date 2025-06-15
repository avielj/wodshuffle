import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get a single strength exercise
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const exercise = await prisma.exercise.findUnique({ where: { id: params.id, type: 'strength' } });
  return NextResponse.json(exercise);
}

// PUT: Update a strength exercise
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const exercise = await prisma.exercise.update({ where: { id: params.id }, data: { ...data, type: 'strength' } });
  return NextResponse.json(exercise);
}

// DELETE: Delete a strength exercise
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.exercise.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
