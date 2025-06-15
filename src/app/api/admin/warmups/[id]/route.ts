import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get a single warmup
export async function GET(req, { params }) {
  const warmup = await prisma.exercise.findUnique({ where: { id: params.id, type: 'warmup' } });
  return NextResponse.json(warmup);
}

// PUT: Update a warmup
export async function PUT(req, { params }) {
  const data = await req.json();
  const warmup = await prisma.exercise.update({ where: { id: params.id }, data: { ...data, type: 'warmup' } });
  return NextResponse.json(warmup);
}

// DELETE: Delete a warmup
export async function DELETE(req, { params }) {
  await prisma.exercise.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
