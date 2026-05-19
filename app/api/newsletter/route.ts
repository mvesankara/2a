import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const { email } = parsed.data;

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Vous êtes déjà inscrit à notre newsletter." });
  }

  await prisma.subscriber.create({ data: { email } });
  return NextResponse.json({ message: "Inscription réussie ! Merci de votre soutien." }, { status: 201 });
}
