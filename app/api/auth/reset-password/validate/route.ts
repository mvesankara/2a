import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false, error: "Token manquant" });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { email: true } } },
  });

  if (!resetToken) {
    return NextResponse.json({ valid: false, error: "Lien invalide ou introuvable" });
  }
  if (resetToken.usedAt) {
    return NextResponse.json({ valid: false, error: "Ce lien a déjà été utilisé" });
  }
  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Ce lien a expiré" });
  }

  return NextResponse.json({ valid: true, maskedEmail: maskEmail(resetToken.user.email) });
}
