import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail, resetPasswordEmailTemplate } from "@/lib/email";

const schema = z.object({
  identifier: z.string().min(1),
});

const SUCCESS_MSG = "Si ce compte existe, un lien de réinitialisation a été envoyé.";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: SUCCESS_MSG }); // Ne pas révéler l'erreur
  }

  const { identifier } = parsed.data;

  // Trouver l'utilisateur par email ou téléphone
  let user: { id: string; email: string } | null = null;

  if (identifier.includes("@")) {
    user = await prisma.user.findUnique({
      where: { email: identifier },
      select: { id: true, email: true },
    });
  } else {
    const profile = await prisma.profile.findFirst({
      where: { phone: identifier },
      select: { userId: true },
    });
    if (profile) {
      user = await prisma.user.findUnique({
        where: { id: profile.userId },
        select: { id: true, email: true },
      });
    }
  }

  if (!user) {
    // Réponse identique même si le compte n'existe pas (sécurité)
    return NextResponse.json({ message: SUCCESS_MSG });
  }

  // Invalider les tokens précédents non utilisés
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  // Générer un token sécurisé
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reinitialiser-mot-de-passe?token=${token}`;

  const emailContent = resetPasswordEmailTemplate(resetUrl, 60);
  await sendEmail({ to: user.email, ...emailContent });

  const response: Record<string, string> = { message: SUCCESS_MSG };

  // En développement uniquement : exposer le lien pour faciliter les tests
  if (process.env.NODE_ENV !== "production") {
    response.devResetUrl = resetUrl;
  }

  return NextResponse.json(response);
}
