import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "6");

  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      shortDescription: true,
      category: true,
      imageUrl: true,
      status: true,
    },
  });

  return NextResponse.json(projects);
}
