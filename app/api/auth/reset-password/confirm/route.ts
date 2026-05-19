import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Données invalides";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return NextResponse.json({ error: "Lien invalide ou introuvable" }, { status: 400 });
  }
  if (resetToken.usedAt) {
    return NextResponse.json({ error: "Ce lien a déjà été utilisé" }, { status: 400 });
  }
  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Ce lien a expiré. Faites une nouvelle demande." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  // Révoquer les autres tokens actifs du même utilisateur
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId, usedAt: null },
  });

  return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
}
