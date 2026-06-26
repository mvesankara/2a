import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TasksManagementPage from "@/components/projects/TasksManagementPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `Tâches – ${project.name} – 2A` : "Tâches – 2A" };
}

export default async function TasksRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect(`/login?redirect=/dashboard/projets/${id}/taches`);

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect(`/login?redirect=/dashboard/projets/${id}/taches`);
  }

  const [user, project] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
    }),
    prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
  ]);

  if (!user?.profile) redirect("/login");
  if (!project) notFound();

  const unreadCount = await prisma.notification.count({
    where: { userId: user.profile.id, isRead: false },
  });

  const breadcrumb = [
    { label: "Projets",  href: "/dashboard/projets" },
    { label: project.name, href: `/dashboard/projets/${id}` },
    { label: "Tâches" },
  ];

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={user.profile} breadcrumb={breadcrumb} />
      <main className="flex-1 overflow-y-auto p-6">
        <TasksManagementPage projectId={id} projectName={project.name} currentProfileId={user.profile.id} />
      </main>
    </>
  );
}
