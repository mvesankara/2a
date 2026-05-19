import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const schema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { identifier, password, rememberMe } = parsed.data;

  // Lookup by email or phone number
  let user: Awaited<ReturnType<typeof prisma.user.findUnique>> & { profile?: unknown } | null = null;

  if (identifier.includes("@")) {
    user = await prisma.user.findUnique({
      where: { email: identifier },
      include: { profile: true },
    });
  } else {
    // Phone lookup: find profile with matching phone, then resolve User
    const profile = await prisma.profile.findFirst({
      where: { phone: identifier },
    });
    if (profile) {
      user = await prisma.user.findUnique({
        where: { id: profile.userId },
        include: { profile: true },
      });
    }
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: "Identifiant ou mot de passe incorrect" },
      { status: 401 }
    );
  }

  const token = signToken({ userId: user.id, email: user.email });

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 jours ou 1 jour

  const response = NextResponse.json({
    token,
    user: { id: user.id, email: user.email },
    profile: (user as { profile: unknown }).profile,
  });

  response.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge,
  });

  return response;
}
