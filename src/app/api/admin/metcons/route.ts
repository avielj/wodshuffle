import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all metcons (Wod model)
export async function GET() {
  const metcons = await prisma.wod.findMany();
  return NextResponse.json(metcons);
}

// POST: Create a new metcon (Wod model)
export async function POST(req: NextRequest) {
  const data = await req.json();
  const metcon = await prisma.wod.create({ data });
  return NextResponse.json(metcon);
}
