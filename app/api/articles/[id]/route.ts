import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const updateSchema = z.object({
  title:      z.string().min(1).max(300).optional(),
  summary:    z.string().max(500).optional(),
  content:    z.string().optional(),
  category:   z.string().optional().nullable(),
  tags:       z.array(z.string()).optional(),
  visibility: z.enum(["public", "membres", "prive"]).optional(),
  published:  z.boolean().optional(),
});

const authorSelect = { id: true, firstName: true, lastName: true, avatarUrl: true } as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { authorProfile: { select: authorSelect } },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const isAuthor = article.authorProfileId === profile.id;
    const isAdmin  = profile.role === "administrateur";
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(parsed.data.title      !== undefined && { title:      parsed.data.title }),
        ...(parsed.data.summary    !== undefined && { summary:    parsed.data.summary }),
        ...(parsed.data.content    !== undefined && { content:    parsed.data.content }),
        ...(parsed.data.category   !== undefined && { category:   parsed.data.category }),
        ...(parsed.data.tags       !== undefined && { tags:       parsed.data.tags }),
        ...(parsed.data.visibility !== undefined && { visibility: parsed.data.visibility }),
        ...(parsed.data.published  !== undefined && { published:  parsed.data.published }),
      },
      include: { authorProfile: { select: authorSelect } },
    });

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const isAuthor = article.authorProfileId === profile.id;
    const isAdmin  = profile.role === "administrateur";
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
