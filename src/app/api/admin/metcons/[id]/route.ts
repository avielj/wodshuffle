import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get a single metcon (Wod model)
export async function GET(req, { params }) {
  const metcon = await prisma.wod.findUnique({ where: { id: params.id } });
  return NextResponse.json(metcon);
}

// PUT: Update a metcon (Wod model)
export async function PUT(req, { params }) {
  const data = await req.json();
  const metcon = await prisma.wod.update({ where: { id: params.id }, data });
  return NextResponse.json(metcon);
}

// DELETE: Delete a metcon (Wod model)
export async function DELETE(req, { params }) {
  await prisma.wod.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
