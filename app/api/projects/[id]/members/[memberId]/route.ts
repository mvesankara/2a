import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const updateSchema = z.object({
  role:   z.enum(["Chef de projet", "Responsable", "Membre"]).optional(),
  team:   z.string().optional().nullable(),
  status: z.enum(["actif", "inactif"]).optional(),
});

async function resolveAndAuthorize(userId: string, projectId: string, memberId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
  if (!profile) return { error: "Profil introuvable", status: 404 as const };

  const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (!member || member.projectId !== projectId) return { error: "Membre introuvable", status: 404 as const };

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { createdByProfileId: true } });
  const isCreator = project?.createdByProfileId === profile.id;
  const isChef = await prisma.projectMember.findUnique({
    where: { projectId_profileId: { projectId, profileId: profile.id } },
    select: { role: true },
  }).then(m => m?.role === "Chef de projet");

  if (!isCreator && !isChef && profile.role !== "administrateur") {
    return { error: "Accès non autorisé", status: 403 as const };
  }

  return { profile, member };
}

// PATCH /api/projects/[id]/members/[memberId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: projectId, memberId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const result = await resolveAndAuthorize(userId, projectId, memberId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: {
        ...(parsed.data.role   !== undefined && { role:   parsed.data.role }),
        ...(parsed.data.team   !== undefined && { team:   parsed.data.team }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      },
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });

    return NextResponse.json(updated);
  });
}

// DELETE /api/projects/[id]/members/[memberId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: projectId, memberId } = await params;
  return requireAuthApi(request, async (_req, { userId }) => {
    const result = await resolveAndAuthorize(userId, projectId, memberId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    await prisma.projectMember.delete({ where: { id: memberId } });
    return NextResponse.json({ success: true });
  });
}
