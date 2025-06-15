import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get a single metcon (Wod model)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const metcon = await prisma.wod.findUnique({ where: { id: params.id } });
  return NextResponse.json(metcon);
}

// PUT: Update a metcon (Wod model)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const metcon = await prisma.wod.update({ where: { id: params.id }, data });
  return NextResponse.json(metcon);
}

// DELETE: Delete a metcon (Wod model)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.wod.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
