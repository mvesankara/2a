import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

// Status mapping: internal enum → display
// en_cours = "Actif" (running), en_revue = "En cours" (in review), cloture = "Terminé"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";
  const status   = searchParams.get("status")   ?? "";
  const city     = searchParams.get("city")     ?? "";
  const sort     = searchParams.get("sort")     ?? "recent";
  const page     = Math.max(1, Number(searchParams.get("page")    ?? "1"));
  const perPage  = Math.min(50, Math.max(1, Number(searchParams.get("perPage") ?? "6")));
  const statsOnly = searchParams.get("statsOnly") === "1";

  const baseWhere = { isPublished: true };

  // Stats are always over the full published set (not filtered)
  const [totalCount, actifCount, enCoursCount, termineCount] = await Promise.all([
    prisma.project.count({ where: baseWhere }),
    prisma.project.count({ where: { ...baseWhere, status: "en_cours" } }),
    prisma.project.count({ where: { ...baseWhere, status: "en_revue" } }),
    prisma.project.count({ where: { ...baseWhere, status: "cloture" } }),
  ]);

  const stats = {
    total:    totalCount,
    actif:    actifCount,
    en_cours: enCoursCount,
    cloture:  termineCount,
  };

  // For statsOnly requests just return stats + filter options
  if (statsOnly) {
    const [categories, cities] = await Promise.all([
      prisma.project.findMany({ where: baseWhere, select: { category: true }, distinct: ["category"] }),
      prisma.project.findMany({ where: baseWhere, select: { city: true }, distinct: ["city"] }),
    ]);
    return NextResponse.json({
      stats,
      categories: categories.map((c) => c.category).filter(Boolean).sort(),
      cities: cities.map((c) => c.city).filter(Boolean).sort(),
    });
  }

  // Build filtered where clause
  const where: Parameters<typeof prisma.project.findMany>[0]["where"] = {
    isPublished: true,
    ...(search   && { OR: [
      { name:             { contains: search,   mode: "insensitive" } },
      { shortDescription: { contains: search,   mode: "insensitive" } },
    ]}),
    ...(category && { category: { equals: category, mode: "insensitive" } }),
    ...(city     && { city:     { equals: city,     mode: "insensitive" } }),
    ...(status   && statusFilter(status)),
  };

  const orderBy = sortToOrderBy(sort);
  const total   = await prisma.project.count({ where });

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
    select: {
      id:               true,
      name:             true,
      shortDescription: true,
      category:         true,
      imageUrl:         true,
      status:           true,
      progress:         true,
      city:             true,
      country:          true,
      createdAt:        true,
    },
  });

  // Distinct filter options (from filtered or all)
  const [allCategories, allCities] = await Promise.all([
    prisma.project.findMany({ where: baseWhere, select: { category: true }, distinct: ["category"] }),
    prisma.project.findMany({ where: baseWhere, select: { city:     true }, distinct: ["city"] }),
  ]);

  return NextResponse.json({
    projects,
    total,
    page,
    perPage,
    stats,
    categories: allCategories.map((c) => c.category).filter(Boolean).sort(),
    cities:     allCities.map((c) => c.city).filter(Boolean).sort(),
  });
}

// ─── POST: Créer un nouveau projet (brouillon) ──────────────────────────────

export async function POST(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { name, category, city, country, shortDescription, problemStatement, startDate, estimatedDuration } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Le titre du projet est requis" }, { status: 400 });
    if (!category)     return NextResponse.json({ error: "La catégorie est requise" }, { status: 400 });
    if (!shortDescription?.trim()) return NextResponse.json({ error: "Le résumé est requis" }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        name:             name.trim(),
        category,
        city:             city?.trim() || null,
        country:          country || "Gabon",
        shortDescription: shortDescription.trim(),
        problemStatement: problemStatement?.trim() || null,
        startDate:        startDate ? new Date(startDate) : null,
        estimatedDuration: estimatedDuration || null,
        isPublished:      false,
        status:           "en_cours",
        progress:         0,
        createdByProfileId: profile.id,
      },
    });

    // Ajouter le créateur comme coordinateur du projet
    await prisma.projectMember.create({
      data: { projectId: project.id, profileId: profile.id, role: "Coordinateur" },
    });

    return NextResponse.json(project, { status: 201 });
  });
}

function statusFilter(display: string): object {
  const map: Record<string, string> = {
    actif:   "en_cours",
    en_cours: "en_revue",
    termine:  "cloture",
  };
  const internal = map[display.toLowerCase()];
  return internal ? { status: internal } : {};
}

function sortToOrderBy(sort: string): Parameters<typeof prisma.project.findMany>[0]["orderBy"] {
  switch (sort) {
    case "oldest":   return { createdAt: "asc"  };
    case "progress_asc":  return { progress: "asc" };
    case "progress_desc": return { progress: "desc" };
    case "name":     return { name: "asc" };
    default:         return { createdAt: "desc" };
  }
}
