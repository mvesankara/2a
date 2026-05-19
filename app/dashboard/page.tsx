import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TasksSection from "@/components/dashboard/TasksSection";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import ActivityPanel from "@/components/dashboard/ActivityPanel";
import DailyQuote from "@/components/dashboard/DailyQuote";
import NextEventBanner from "@/components/dashboard/NextEventBanner";
import GlobalStatsBar from "@/components/dashboard/GlobalStatsBar";

export const metadata = { title: "Tableau de bord – 2A Acteurs de l'Avenir" };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
  if (!user?.profile) redirect("/login");

  const profile = user.profile;

  const [projectMembers, tasks, notifications, nextEvent, memberCount, articleCount, eventCount, avgProgress] =
    await Promise.all([
      prisma.projectMember.findMany({
        where: { profileId: profile.id },
        include: { project: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),

      prisma.task.findMany({
        where: { profileId: profile.id },
        include: { project: { select: { id: true, name: true } } },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),

      prisma.notification.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),

      prisma.event.findFirst({
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      }),

      prisma.profile.count({ where: { status: "approved" } }),
      prisma.article.count({ where: { published: true } }),
      prisma.event.count({ where: { startDate: { gte: new Date() } } }),

      prisma.project.aggregate({
        where: { status: "en_cours", isPublished: true },
        _avg: { progress: true },
      }),
    ]);

  const activeProjects = projectMembers.filter((m) => m.project.status === "en_cours").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const stats = {
    activeProjects,
    pendingTasks,
    totalMembers: memberCount || 28,
    publishedArticles: articleCount || 3,
  };

  const globalStats = {
    actionsRealisees: 156,
    participants: memberCount || 47,
    tauxAvancement: Math.round(avgProgress._avg.progress ?? 0) || 85,
    evenements: eventCount || 6,
  };

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={profile} />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <WelcomeBanner firstName={profile.firstName} />
        <StatsCards stats={stats} />

        {/* 3-column content grid */}
        <div className="flex gap-5 min-h-0">
          {/* Left column: projects + event + global stats */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <ProjectsSection
              projects={projectMembers.map((m) => ({
                id: m.project.id,
                name: m.project.name,
                category: m.project.category,
                imageUrl: m.project.imageUrl,
                progress: m.project.progress,
                status: m.project.status,
                endDate: m.project.endDate ? m.project.endDate.toISOString() : null,
              }))}
            />
            {nextEvent && (
              <NextEventBanner
                event={{
                  id: nextEvent.id,
                  title: nextEvent.title,
                  location: nextEvent.location,
                  startDate: nextEvent.startDate.toISOString(),
                }}
              />
            )}
            <GlobalStatsBar stats={globalStats} />
          </div>

          {/* Center column: tasks */}
          <div className="flex-1 min-w-0">
            <TasksSection
              initialTasks={tasks.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                dueDate: t.dueDate ? t.dueDate.toISOString() : null,
                projectName: t.project?.name ?? null,
                priority: t.priority,
              }))}
              profileId={profile.id}
            />
          </div>

          {/* Right column: notifications + activity + quote */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-4">
            <NotificationsPanel
              notifications={notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.isRead,
                createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
              }))}
            />
            <ActivityPanel />
            <DailyQuote />
          </div>
        </div>
      </main>
    </>
  );
}
