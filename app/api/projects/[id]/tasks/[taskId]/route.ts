import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

type P = { params: Promise<{ id: string; taskId: string }> };

// ─── PATCH: Modifier une tâche ────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: P) {
  const { id, taskId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.projectId !== id) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    const isMember = await prisma.projectMember.findFirst({ where: { projectId: id, profileId: profile.id } });
    const isAdmin  = profile.role === "administrateur";
    if (!isMember && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    const body = await req.json().catch(() => ({}));

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(body.title             !== undefined && { title: body.title?.trim() || task.title }),
        ...(body.description       !== undefined && { description: body.description }),
        ...(body.assignedProfileId !== undefined && { profileId: body.assignedProfileId || null }),
        ...(body.status            !== undefined && { status: body.status }),
        ...(body.priority          !== undefined && { priority: body.priority }),
        ...(body.progress          !== undefined && { progress: Math.min(100, Math.max(0, Number(body.progress))) }),
        ...(body.isBlocked         !== undefined && { isBlocked: Boolean(body.isBlocked) }),
        ...(body.dueDate           !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      },
      include: {
        profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    const members = await prisma.projectMember.findMany({ where: { projectId: id } });
    const roleMap = new Map(members.map((m) => [m.profileId, m.role]));

    return NextResponse.json({
      ...updated,
      projectRole: updated.profileId ? (roleMap.get(updated.profileId) ?? null) : null,
      dueDate: updated.dueDate?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}

// ─── DELETE: Supprimer une tâche ──────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: P) {
  const { id, taskId } = await params;
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.projectId !== id) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    const isMember = await prisma.projectMember.findFirst({ where: { projectId: id, profileId: profile.id } });
    const isAdmin  = profile.role === "administrateur";
    if (!isMember && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  });
}
