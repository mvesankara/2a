import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PersonalSpace from "@/components/personal-space/PersonalSpace";
import { Loader2 } from "lucide-react";

export const metadata = { title: "Espace personnel – 2A Acteurs de l'Avenir" };

export default async function EspacePersonnelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login?redirect=/dashboard/espace-personnel");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?redirect=/dashboard/espace-personnel");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
  if (!user?.profile) redirect("/login");

  const profile = user.profile;

  const [projectMembers, completedTasksCount, completedTasksThisMonth, articlesPublished, articlesPending, notifications, upcomingEvents, documents] =
    await Promise.all([
      prisma.projectMember.findMany({
        where: { profileId: profile.id },
        include: { project: { select: { id: true, name: true, imageUrl: true, progress: true, status: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where: { profileId: profile.id, status: "done" } }),
      prisma.task.count({
        where: {
          profileId: profile.id,
          status: "done",
          updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.article.count({ where: { userId: payload.userId, published: true } }),
      prisma.article.count({ where: { userId: payload.userId, published: false } }),
      prisma.notification.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.event.findMany({
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
      prisma.document.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const activeProjectsCount = projectMembers.filter((m) => m.project.status === "en_cours").length;

  // Compute activities from available data
  const recentTasks = await prisma.task.findMany({
    where: { profileId: profile.id, status: "done" },
    orderBy: { updatedAt: "desc" },
    take: 2,
    include: { project: { select: { name: true } } },
  });

  const activities = [
    ...recentTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task_completed",
      title: "Vous avez terminé la tâche",
      description: `"${t.title}"${t.project ? ` — ${t.project.name}` : ""}`,
      createdAt: t.updatedAt.toISOString(),
    })),
    ...projectMembers.slice(0, 2).map((m) => ({
      id: `proj-${m.id}`,
      type: "project_joined",
      title: "Vous avez rejoint le projet",
      description: `"${m.project.name}"`,
      createdAt: m.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
    ...notifications.slice(0, 2).map((n) => ({
      id: `notif-${n.id}`,
      type: n.type,
      title: n.title,
      description: n.message,
      createdAt: n.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const data = {
    profile: {
      id: profile.id,
      userId: payload.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      email: profile.email ?? user.email,
      avatarUrl: profile.avatarUrl,
      city: profile.city,
      country: profile.country,
      personalDescription: profile.personalDescription,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      gender: profile.gender,
      phone: profile.phone,
      role: profile.role,
      status: profile.status,
      skills: profile.skills,
      motivation: profile.motivation,
      associationContribution: profile.associationContribution,
      createdAt: profile.createdAt.toISOString(),
    },
    projects: projectMembers.slice(0, 3).map((m) => ({
      id: m.project.id,
      name: m.project.name,
      imageUrl: m.project.imageUrl,
      progress: m.project.progress,
      status: m.project.status,
      memberRole: m.role,
    })),
    engagement: {
      projectsCount: projectMembers.length,
      activeProjectsCount,
      tasksCompleted: completedTasksCount,
      tasksThisMonth: completedTasksThisMonth,
      hoursInvested: Math.round(completedTasksCount * 2),
      hoursThisMonth: Math.round(completedTasksThisMonth * 2),
      articlesPublished,
      articlesPending,
    },
    activities,
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      startDate: e.startDate.toISOString(),
    })),
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      fileType: d.fileType,
      sizeBytes: d.sizeBytes,
      createdAt: d.createdAt.toISOString(),
    })),
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };

  return (
    <>
      <DashboardHeader unreadCount={data.unreadCount} profile={data.profile} />
      <main className="flex-1 overflow-y-auto p-6">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
          <PersonalSpace data={data} />
        </Suspense>
      </main>
    </>
  );
}
