import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MyTasksPage from "@/components/tasks/MyTasksPage";

export const metadata = { title: "Mes tâches – 2A" };

export default async function TachesRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login?redirect=/dashboard/taches");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?redirect=/dashboard/taches");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
    },
  });
  if (!user?.profile) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: user.profile.id, isRead: false },
  });

  const breadcrumb = [
    { label: "Accueil", href: "/dashboard" },
    { label: "Mes tâches" },
  ];

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={user.profile} breadcrumb={breadcrumb} />
      <main className="flex-1 overflow-y-auto p-6">
        <MyTasksPage currentProfileId={user.profile.id} />
      </main>
    </>
  );
}
