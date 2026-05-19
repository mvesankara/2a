import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done", "review"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  projectId: z.string().optional().nullable(),
});

async function resolveProfileAndTask(userId: string, taskId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) return { error: "Profil introuvable", status: 404 as const };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Tâche introuvable", status: 404 as const };
  if (task.profileId !== profile.id) return { error: "Accès refusé", status: 403 as const };

  return { profileId: profile.id, task };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuthApi(request, async (req, { userId }) => {
    const { id } = await params;
    const result = await resolveProfileAndTask(userId, id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { dueDate, ...rest } = parsed.data;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: { project: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuthApi(request, async (_req, { userId }) => {
    const { id } = await params;
    const result = await resolveProfileAndTask(userId, id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
