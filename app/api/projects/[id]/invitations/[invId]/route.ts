import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

async function canManage(profileId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { createdByProfileId: true } });
  if (!project) return false;
  if (project.createdByProfileId === profileId) return true;
  const member = await prisma.projectMember.findUnique({
    where: { projectId_profileId: { projectId, profileId } },
    select: { role: true },
  });
  return member?.role === "Chef de projet";
}

// PATCH /api/projects/[id]/invitations/[invId] — cancel/resend
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invId: string }> }
) {
  const { id: projectId, invId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const allowed = await canManage(profile.id, projectId);
    if (!allowed && profile.role !== "administrateur") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const inv = await prisma.projectInvitation.findUnique({ where: { id: invId } });
    if (!inv || inv.projectId !== projectId) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const updated = await prisma.projectInvitation.update({
      where: { id: invId },
      data: { status: body.status ?? inv.status },
    });

    return NextResponse.json(updated);
  });
}

// DELETE /api/projects/[id]/invitations/[invId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invId: string }> }
) {
  const { id: projectId, invId } = await params;
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const allowed = await canManage(profile.id, projectId);
    if (!allowed && profile.role !== "administrateur") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const inv = await prisma.projectInvitation.findUnique({ where: { id: invId } });
    if (!inv || inv.projectId !== projectId) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    await prisma.projectInvitation.delete({ where: { id: invId } });
    return NextResponse.json({ success: true });
  });
}
