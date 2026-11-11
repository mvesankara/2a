import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const respondSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

// PATCH /api/participations/invitations/[invId] — le destinataire accepte ou refuse SA propre invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invId: string }> }
) {
  const { invId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, email: true },
    });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const invitation = await prisma.projectInvitation.findUnique({ where: { id: invId } });
    if (!invitation) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }
    if (!profile.email || invitation.email !== profile.email) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Cette invitation a déjà été traitée" }, { status: 409 });
    }

    const body = await req.json().catch(() => null);
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    if (parsed.data.action === "accept") {
      const [, updatedInvitation] = await prisma.$transaction([
        prisma.projectMember.upsert({
          where: { projectId_profileId: { projectId: invitation.projectId, profileId: profile.id } },
          update: {},
          create: {
            projectId: invitation.projectId,
            profileId: profile.id,
            role: invitation.role,
          },
        }),
        prisma.projectInvitation.update({
          where: { id: invId },
          data: { status: "accepted" },
        }),
      ]);
      return NextResponse.json(updatedInvitation);
    }

    const updated = await prisma.projectInvitation.update({
      where: { id: invId },
      data: { status: "rejected" },
    });
    return NextResponse.json(updated);
  });
}
