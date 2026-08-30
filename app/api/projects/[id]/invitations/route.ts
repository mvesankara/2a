import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const inviteSchema = z.object({
  email:     z.string().email(),
  role:      z.enum(["Chef de projet", "Responsable", "Membre"]).default("Membre"),
  specialty: z.string().optional(),
});

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

// GET /api/projects/[id]/invitations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const invitations = await prisma.projectInvitation.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { invitedBy: { select: { firstName: true, lastName: true } } },
  });
  return NextResponse.json(invitations);
}

// POST /api/projects/[id]/invitations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const allowed = await canManage(profile.id, projectId);
    if (!allowed && profile.role !== "administrateur") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    // Check if already a member
    const existingProfile = await prisma.profile.findFirst({ where: { email: parsed.data.email }, select: { id: true } });
    if (existingProfile) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_profileId: { projectId, profileId: existingProfile.id } },
      });
      if (isMember) return NextResponse.json({ error: "Cette personne est déjà membre du projet" }, { status: 409 });
    }

    // Upsert invitation (resend if rejected/expired)
    const invitation = await prisma.projectInvitation.upsert({
      where: { projectId_email: { projectId, email: parsed.data.email } },
      update: { role: parsed.data.role, specialty: parsed.data.specialty, status: "pending", createdAt: new Date() },
      create: {
        projectId,
        email:     parsed.data.email,
        role:      parsed.data.role,
        specialty: parsed.data.specialty,
        status:    "pending",
        invitedByProfileId: profile.id,
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  });
}
