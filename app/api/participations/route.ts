import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

// GET /api/participations — vue d'ensemble des participations projet de l'utilisateur courant
export async function GET(request: NextRequest) {
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, email: true },
    });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const now = new Date();

    const [memberships, assignedTasksCount, pendingInvitations, suggestions] = await Promise.all([
      prisma.projectMember.findMany({
        where: { profileId: profile.id },
        include: {
          project: {
            include: {
              members: { select: { id: true } },
              activities: {
                where: { date: { gte: now } },
                orderBy: { date: "asc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.task.count({
        where: { profileId: profile.id, status: { notIn: ["done", "review"] } },
      }),

      profile.email
        ? prisma.projectInvitation.findMany({
            where: { email: profile.email, status: "pending" },
            include: { project: { select: { id: true, name: true, category: true, imageUrl: true } } },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      prisma.project.findMany({
        where: {
          isPublished: true,
          members: { none: { profileId: profile.id } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          category: true,
          shortDescription: true,
          imageUrl: true,
        },
      }),
    ]);

    const participations = memberships.map((m) => ({
      id: m.id,
      role: m.role,
      status: m.status,
      project: {
        id: m.project.id,
        name: m.project.name,
        shortDescription: m.project.shortDescription,
        category: m.project.category,
        imageUrl: m.project.imageUrl,
        status: m.project.status,
        progress: m.project.progress,
        memberCount: m.project.members.length,
      },
      nextMilestone: m.project.activities[0]
        ? { title: m.project.activities[0].title, date: m.project.activities[0].date }
        : null,
    }));

    const stats = {
      total: participations.length,
      enCours: participations.filter((p) => p.project.status === "en_cours").length,
      termines: participations.filter((p) => p.project.status === "cloture").length,
      tachesAssignees: assignedTasksCount,
    };

    return NextResponse.json({
      participations,
      stats,
      invitations: pendingInvitations.map((i) => ({
        id: i.id,
        role: i.role,
        specialty: i.specialty,
        createdAt: i.createdAt,
        project: i.project,
      })),
      suggestions,
    });
  });
}
