import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const createSchema = z.object({
  title:      z.string().min(1).max(300),
  summary:    z.string().max(500).default(""),
  content:    z.string().default(""),
  category:   z.string().optional().nullable(),
  tags:       z.array(z.string()).optional().default([]),
  visibility: z.enum(["public", "membres", "prive"]).optional().default("public"),
  published:  z.boolean().optional().default(false),
});

const authorSelect = {
  id: true, firstName: true, lastName: true, avatarUrl: true,
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search     = searchParams.get("search")   ?? "";
  const category   = searchParams.get("category") ?? "";
  const status     = searchParams.get("status")   ?? "";   // "published" | "draft" | ""
  const authorId   = searchParams.get("authorId") ?? "";
  const sortBy     = searchParams.get("sortBy")   ?? "recent"; // recent | views | likes | title
  const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit      = Math.min(50, Math.max(3, parseInt(searchParams.get("limit") ?? "6", 10)));

  const where: Parameters<typeof prisma.article.findMany>[0]["where"] = {};

  if (search)   where.OR = [
    { title:   { contains: search, mode: "insensitive" } },
    { summary: { contains: search, mode: "insensitive" } },
  ];
  if (category) where.category = category;
  if (status === "published") where.published = true;
  if (status === "draft")     where.published = false;
  if (authorId) where.authorProfileId = authorId;

  const orderMap: Record<string, Parameters<typeof prisma.article.findMany>[0]["orderBy"]> = {
    recent: [{ date: "desc" }, { createdAt: "desc" }],
    views:  { views: "desc" },
    likes:  { likes: "desc" },
    title:  { title: "asc" },
  };

  const [articles, total, allForStats] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { authorProfile: { select: authorSelect } },
      orderBy: orderMap[sortBy] ?? orderMap.recent,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      select: { published: true, views: true, likes: true },
    }),
  ]);

  const stats = {
    total:      allForStats.length,
    published:  allForStats.filter(a => a.published).length,
    drafts:     allForStats.filter(a => !a.published).length,
    totalViews: allForStats.reduce((s, a) => s + a.views, 0),
    totalLikes: allForStats.reduce((s, a) => s + a.likes, 0),
  };

  // Categories list
  const categories = [...new Set(
    (await prisma.article.findMany({ select: { category: true } }))
      .map(a => a.category).filter(Boolean) as string[]
  )].sort();

  return NextResponse.json({
    articles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats,
    categories,
  });
}

export async function POST(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

    const article = await prisma.article.create({
      data: {
        title:           parsed.data.title,
        summary:         parsed.data.summary,
        content:         parsed.data.content,
        category:        parsed.data.category ?? null,
        tags:            parsed.data.tags ?? [],
        visibility:      parsed.data.visibility ?? "public",
        published:       parsed.data.published ?? false,
        authorProfileId: profile.id,
        userId:          userId,
        date:            new Date(),
      },
      include: { authorProfile: { select: authorSelect } },
    });

    return NextResponse.json(article, { status: 201 });
  });
}
