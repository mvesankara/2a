import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const addSchema = z.object({
  profileId: z.string().min(1),
  role:      z.enum(["Chef de projet", "Responsable", "Membre"]).default("Membre"),
  team:      z.string().optional(),
});

async function resolveProfile(userId: string) {
  return prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
}

async function canManage(profileId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { createdByProfileId: true } });
  if (!project) return false;
  if (project.createdByProfileId === profileId) return true;
  const member = await prisma.projectMember.findUnique({
    where: { projectId_profileId: { projectId, profileId } },
    select: { role: true },
  });
  return member?.role === "Chef de projet";
}

// GET /api/projects/[id]/members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const { searchParams } = request.nextUrl;
  const search    = searchParams.get("search") ?? "";
  const role      = searchParams.get("role") ?? "";
  const status    = searchParams.get("status") ?? "";
  const team      = searchParams.get("team") ?? "";
  const sortBy    = searchParams.get("sortBy") ?? "createdAt";
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit     = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") ?? "10", 10)));

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, status: true },
  });
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  const where: Parameters<typeof prisma.projectMember.findMany>[0]["where"] = {
    projectId,
    ...(role   && { role }),
    ...(status && { status }),
    ...(team   && { team: { contains: team, mode: "insensitive" } }),
    ...(search && {
      profile: {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName:  { contains: search, mode: "insensitive" } },
          { email:     { contains: search, mode: "insensitive" } },
        ],
      },
    }),
  };

  const orderMap: Record<string, Parameters<typeof prisma.projectMember.findMany>[0]["orderBy"]> = {
    createdAt: { createdAt: "asc" },
    name:      { profile: { firstName: "asc" } },
    role:      { role: "asc" },
  };

  const [members, total, allMembers] = await Promise.all([
    prisma.projectMember.findMany({
      where,
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true } } },
      orderBy: orderMap[sortBy] ?? orderMap.createdAt,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.projectMember.count({ where }),
    prisma.projectMember.findMany({
      where: { projectId },
      select: { role: true },
    }),
  ]);

  // Stats
  const stats = {
    total:          allMembers.length,
    chefDeProjet:   allMembers.filter(m => m.role === "Chef de projet").length,
    responsable:    allMembers.filter(m => m.role === "Responsable").length,
    membre:         allMembers.filter(m => m.role === "Membre").length,
    pendingInvitations: await prisma.projectInvitation.count({ where: { projectId, status: "pending" } }),
  };

  // Teams list (distinct)
  const teams = [...new Set(
    (await prisma.projectMember.findMany({ where: { projectId }, select: { team: true } }))
      .map(m => m.team).filter(Boolean) as string[]
  )].sort();

  return NextResponse.json({
    members,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats,
    project,
    teams,
  });
}

// POST /api/projects/[id]/members — ajouter un membre
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await resolveProfile(userId);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const allowed = await canManage(profile.id, projectId);
    if (!allowed && profile.role !== "administrateur") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_profileId: { projectId, profileId: parsed.data.profileId } },
    });
    if (existing) return NextResponse.json({ error: "Ce membre est déjà dans le projet" }, { status: 409 });

    const member = await prisma.projectMember.create({
      data: { projectId, profileId: parsed.data.profileId, role: parsed.data.role, team: parsed.data.team },
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });

    return NextResponse.json(member, { status: 201 });
  });
}
