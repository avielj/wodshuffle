import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get a single workout
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const wod = await prisma.wod.findUnique({ where: { id: params.id } });
  return NextResponse.json(wod);
}

// PUT: Update a workout
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const wod = await prisma.wod.update({ where: { id: params.id }, data });
  return NextResponse.json(wod);
}

// DELETE: Delete a workout
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.wod.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
