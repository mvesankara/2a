import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectDetailPage from "@/components/projects/ProjectDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `${project.name} – 2A` : "Projet – 2A" };
}

export default async function ProjectDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect(`/login?redirect=/dashboard/projets/${id}`);

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect(`/login?redirect=/dashboard/projets/${id}`);
  }

  const [user, project] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
    }),
    prisma.project.findUnique({
      where: { id },
      include: {
        createdByProfile: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: {
            profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        tasks: {
          select: { id: true, title: true, status: true, dueDate: true },
          orderBy: { createdAt: "desc" },
        },
        activities: { orderBy: { order: "asc" } },
        indicators: { orderBy: { order: "asc" } },
        documents: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
  ]);

  if (!user?.profile) redirect("/login");
  if (!project) notFound();

  const unreadCount = await prisma.notification.count({
    where: { userId: user.profile.id, isRead: false },
  });

  // Sérialiser les dates pour le client
  const data = {
    project: {
      id:                  project.id,
      name:                project.name,
      shortDescription:    project.shortDescription,
      description:         project.description,
      category:            project.category,
      imageUrl:            project.imageUrl,
      isPublished:         project.isPublished,
      status:              project.status,
      priority:            project.priority,
      progress:            project.progress,
      city:                project.city,
      country:             project.country,
      estimatedDuration:   project.estimatedDuration,
      objectives:          project.objectives,
      plannedActivities:   project.plannedActivities,
      targetBeneficiaries: project.targetBeneficiaries,
      successIndicators:   project.successIndicators,
      budget:              project.budget,
      budgetSpent:         project.budgetSpent,
      budgetSources:       project.budgetSources,
      humanResources:      project.humanResources,
      startDate:           project.startDate?.toISOString() ?? null,
      endDate:             project.endDate?.toISOString() ?? null,
      createdAt:           project.createdAt?.toISOString() ?? null,
      updatedAt:           project.updatedAt?.toISOString() ?? null,
      createdByProfile:    project.createdByProfile
        ? { id: project.createdByProfile.id, firstName: project.createdByProfile.firstName, lastName: project.createdByProfile.lastName }
        : null,
      members: project.members.map((m) => ({
        id: m.id, role: m.role,
        profile: { id: m.profile.id, firstName: m.profile.firstName, lastName: m.profile.lastName, avatarUrl: m.profile.avatarUrl },
      })),
      tasks: project.tasks.map((t) => ({
        id: t.id, title: t.title, status: t.status, dueDate: t.dueDate?.toISOString() ?? null,
      })),
      activities: project.activities.map((a) => ({
        id: a.id, title: a.title, status: a.status, order: a.order,
        date: a.date?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
      indicators: project.indicators.map((i) => ({
        id: i.id, label: i.label, current: i.current, target: i.target, unit: i.unit,
      })),
      documents: project.documents.map((d) => ({
        id: d.id, name: d.name, fileType: d.fileType, sizeBytes: d.sizeBytes,
        createdAt: d.createdAt.toISOString(),
      })),
    },
    currentProfileId: user.profile.id,
  };

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={user.profile} />
      <main className="flex-1 overflow-y-auto p-6">
        <ProjectDetailPage data={data} />
      </main>
    </>
  );
}
