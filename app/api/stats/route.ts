import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(stats);
}
