import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    return NextResponse.json(profile);
  });
}

export async function PATCH(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const body = await req.json().catch(() => ({}));
    const {
      firstName, lastName, city, country, personalDescription,
      skills, associationContribution, phone, gender, motivation,
      dateOfBirth, address, profession, organization, interests,
      membershipType, membershipExpiresAt,
    } = body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(personalDescription !== undefined && { personalDescription }),
        ...(skills !== undefined && { skills }),
        ...(associationContribution !== undefined && { associationContribution }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(motivation !== undefined && { motivation }),
        ...(address !== undefined && { address }),
        ...(profession !== undefined && { profession }),
        ...(organization !== undefined && { organization }),
        ...(interests !== undefined && { interests }),
        ...(membershipType !== undefined && { membershipType }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        }),
        ...(membershipExpiresAt !== undefined && {
          membershipExpiresAt: membershipExpiresAt ? new Date(membershipExpiresAt) : null,
        }),
      },
    });

    return NextResponse.json(profile);
  });
}
