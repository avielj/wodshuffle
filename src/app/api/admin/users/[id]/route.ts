import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE: Delete a user
export async function DELETE(req, { params }) {
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
