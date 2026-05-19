import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().optional().nullable(),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
});

export async function GET(request: NextRequest) {
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return NextResponse.json([]);

    const tasks = await prisma.task.findMany({
      where: { profileId: profile.id },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  });
}

export async function POST(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { dueDate, title, description, projectId, priority } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        ...(description !== undefined && { description }),
        ...(projectId !== undefined && projectId !== null && { projectId }),
        ...(priority !== undefined && { priority }),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        profileId: profile.id,
      },
      include: { project: { select: { id: true, name: true } } },
    });

    return NextResponse.json(task, { status: 201 });
  });
}
