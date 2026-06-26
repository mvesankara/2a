import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

// ─── GET: Détail d'un projet ─────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
  });
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  return NextResponse.json(project);
}

// ─── PATCH: Mettre à jour un projet ─────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const isCreator = project.createdByProfileId === profile.id;
    const isAdmin   = profile.role === "administrateur";
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name             !== undefined && { name: body.name?.trim() || project.name }),
        ...(body.category         !== undefined && { category: body.category }),
        ...(body.city             !== undefined && { city: body.city }),
        ...(body.country          !== undefined && { country: body.country }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.problemStatement !== undefined && { problemStatement: body.problemStatement }),
        ...(body.estimatedDuration!== undefined && { estimatedDuration: body.estimatedDuration }),
        ...(body.objectives       !== undefined && { objectives: body.objectives }),
        ...(body.plannedActivities!== undefined && { plannedActivities: body.plannedActivities }),
        ...(body.targetBeneficiaries!==undefined && { targetBeneficiaries: body.targetBeneficiaries }),
        ...(body.successIndicators!== undefined && { successIndicators: body.successIndicators }),
        ...(body.budget           !== undefined && { budget: body.budget != null ? Number(body.budget) : null }),
        ...(body.budgetSources    !== undefined && { budgetSources: body.budgetSources }),
        ...(body.humanResources   !== undefined && { humanResources: body.humanResources }),
        ...(body.materialResources!== undefined && { materialResources: body.materialResources }),
        ...(body.isPublished      !== undefined && { isPublished: Boolean(body.isPublished) }),
        ...(body.status           !== undefined && { status: body.status }),
        ...(body.description      !== undefined && { description: body.description }),
        ...(body.startDate        !== undefined && {
          startDate: body.startDate ? new Date(body.startDate) : null,
        }),
        ...(body.endDate          !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
      },
    });

    return NextResponse.json(updated);
  });
}
